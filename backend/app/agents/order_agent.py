from typing import Dict, Any, Optional, List
from app.services.ai_service import ai_service


class OrderAgent:
    """Order agent for order tracking and management."""
    
    def __init__(self):
        self.ai_service = ai_service

    async def handle_message(
        self,
        message: str,
        customer_orders: Optional[List[Dict[str, Any]]] = None,
        customer_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Handle an order-related message.
        """
        # Extract order number if present
        order_number = self._extract_order_number(message)
        
        if order_number and customer_orders:
            # Find the specific order
            order = next((o for o in customer_orders if o.get('order_number') == order_number), None)
            if order:
                return await self._format_order_status(order)
        
        # If no specific order found, show recent orders
        if customer_orders:
            return await self._format_recent_orders(customer_orders)
        
        # No orders found
        return "I couldn't find any orders for your account. If you believe this is an error, please contact our support team."

    async def _format_order_status(self, order: Dict[str, Any]) -> str:
        """Format order status for customer."""
        status = order.get('status', 'unknown')
        order_num = order.get('order_number', 'N/A')
        total = order.get('total', 0)
        tracking = order.get('tracking_number', 'Not available')
        estimated_delivery = order.get('estimated_delivery')

        newline = "\n"
        response = f"Order #{order_num}{newline}"
        response += f"Status: {status.upper()}{newline}"
        response += f"Total: PKR {total}{newline}"

        if tracking and tracking != "Not available":
            response += f"Tracking Number: {tracking}{newline}"

        if estimated_delivery:
            response += f"Estimated Delivery: {estimated_delivery.strftime('%Y-%m-%d')}{newline}"

        # Add status-specific message
        status_messages = {
            'pending': "Your order is being processed.",
            'confirmed': "Your order has been confirmed!",
            'processing': "Your order is being prepared for shipment.",
            'shipped': "Your order has been shipped and is on its way!",
            'delivered': "Your order has been delivered. Thank you for your purchase!",
            'cancelled': "This order has been cancelled.",
            'refunded': "This order has been refunded."
        }

        response += status_messages.get(status, "Your order is being processed.")

        return response

    async def _format_recent_orders(self, orders: List[Dict[str, Any]]) -> str:
        """Format recent orders for customer."""
        if not orders:
            return "No orders found."

        newline = "\n"
        response = "Here are your recent orders:" + newline + newline

        for order in orders[:5]:  # Show last 5 orders
            order_num = order.get('order_number', 'N/A')
            status = order.get('status', 'unknown')
            total = order.get('total', 0)
            date = order.get('created_at', 'N/A')

            response += f"Order #{order_num}{newline}"
            response += f"Status: {status.upper()} | Total: PKR {total}{newline}"
            response += f"Date: {date}{newline}{newline}"

        response += "Please provide an order number if you need detailed information about a specific order."

        return response

    def _extract_order_number(self, message: str) -> Optional[str]:
        """Extract order number from message."""
        import re
        
        # Look for patterns like "order #12345" or "order 12345"
        patterns = [
            r'order\s*#?\s*(\d+)',
            r'#(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None


order_agent = OrderAgent()
