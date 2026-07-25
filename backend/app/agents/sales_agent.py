from typing import Dict, Any, Optional, List
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service


class SalesAgent:
    """Sales agent for product recommendations and sales inquiries."""
    
    def __init__(self):
        self.ai_service = ai_service
        self.rag_service = rag_service

    async def handle_message(
        self,
        message: str,
        business_id: int,
        customer_context: Optional[Dict[str, Any]] = None,
        products: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Handle a sales-related message.
        """
        # Build context from products if available
        product_context = ""
        if products:
            product_context = self._format_products(products)
        
        # Build prompt
        newline = "\n"
        products_section = f"Available Products:{newline}{product_context}" if product_context else ""
        context_section = f"Customer Context: {customer_context}" if customer_context else ""

        prompt = f"""
        You are a sales assistant for a business. Help the customer with product inquiries and recommendations.

        {products_section}

        {context_section}

        Customer Message: {message}

        Provide helpful, friendly sales assistance. If you do not have product information, ask for more details.
        """
        
        return await self.ai_service.generate_response(prompt)

    async def recommend_products(
        self,
        query: str,
        products: List[Dict[str, Any]],
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Recommend products based on a query.
        """
        # Simple keyword matching (can be improved with embeddings)
        query_lower = query.lower()
        
        scored_products = []
        for product in products:
            score = 0
            name = product.get('name', '').lower()
            description = (product.get('description') or '').lower()
            category = (product.get('category') or '').lower()
            tags = (product.get('tags') or '').lower()
            
            # Score based on matches
            if query_lower in name:
                score += 10
            if query_lower in description:
                score += 5
            if query_lower in category:
                score += 7
            if query_lower in tags:
                score += 3
            
            # Price range matching (simplified)
            if 'under' in query_lower or 'below' in query_lower:
                try:
                    max_price = int(''.join(filter(str.isdigit, query_lower)))
                    if product.get('price', 0) <= max_price:
                        score += 8
                except:
                    pass
            
            if score > 0:
                scored_products.append({**product, 'score': score})
        
        # Sort by score and return top results
        scored_products.sort(key=lambda x: x['score'], reverse=True)
        return scored_products[:limit]

    def _format_products(self, products: List[Dict[str, Any]]) -> str:
        """Format products for the prompt."""
        formatted = []
        for product in products[:10]:  # Limit to 10 products
            formatted.append(
                f"- {product.get('name', 'N/A')}: "
                f"PKR {product.get('price', 0)} | "
                f"{(product.get('description') or 'No description')[:100]}"
            )
        newline = "\n"
        return newline.join(formatted)


sales_agent = SalesAgent()
