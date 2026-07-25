import json
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.chat import Chat
from app.models.message import Message
from app.models.customer import Customer
from app.services.cache_service import cache_service


class MemoryService:
    """Service for managing customer conversation memory and context."""
    
    def __init__(self):
        self.memory_ttl = 86400  # 24 hours in seconds
    
    async def get_customer_memory(
        self,
        customer_id: int,
        business_id: int,
        db: Session,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Retrieve customer's conversation history and context.
        """
        # Try to get from cache first
        cached_memory = cache_service.get_customer_memory(customer_id, business_id)
        if cached_memory:
            return cached_memory
        
        # Get recent messages
        messages = db.query(Message).join(Chat).filter(
            Chat.customer_id == customer_id,
            Chat.business_id == business_id
        ).order_by(Message.created_at.desc()).limit(limit).all()
        
        # Format messages for context
        conversation_history = []
        for msg in reversed(messages):
            conversation_history.append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat() if msg.created_at else None
            })
        
        # Get customer information
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        customer_info = {}
        if customer:
            customer_info = {
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "created_at": customer.created_at.isoformat() if customer.created_at else None
            }
        
        # Get recent chat context
        recent_chat = db.query(Chat).filter(
            Chat.customer_id == customer_id,
            Chat.business_id == business_id
        ).order_by(Chat.updated_at.desc()).first()
        
        chat_context = {}
        if recent_chat:
            chat_context = {
                "chat_id": recent_chat.id,
                "status": recent_chat.status,
                "last_active": recent_chat.updated_at.isoformat() if recent_chat.updated_at else None
            }
        
        memory = {
            "customer": customer_info,
            "conversation_history": conversation_history,
            "chat_context": chat_context,
            "summary": self._generate_conversation_summary(conversation_history)
        }
        
        # Cache the memory
        cache_service.cache_customer_memory(customer_id, business_id, memory)
        
        return memory
    
    def _generate_conversation_summary(self, messages: List[Dict]) -> str:
        """Generate a brief summary of the conversation."""
        if not messages:
            return "No conversation history available."
        
        # Extract key topics from messages
        user_messages = [msg for msg in messages if msg["role"] == "user"]
        
        if not user_messages:
            return "No user messages in conversation history."
        
        # Simple summary based on last few messages
        recent_messages = user_messages[-3:] if len(user_messages) >= 3 else user_messages
        topics = []
        
        for msg in recent_messages:
            content = msg["content"].lower()
            if "price" in content or "cost" in content:
                topics.append("pricing inquiry")
            elif "order" in content:
                topics.append("order related")
            elif "product" in content:
                topics.append("product inquiry")
            elif "delivery" in content or "shipping" in content:
                topics.append("delivery inquiry")
        
        if topics:
            return f"Customer discussed: {', '.join(set(topics))}"
        
        return f"Recent conversation with {len(user_messages)} user messages"
    
    async def update_memory(
        self,
        customer_id: int,
        business_id: int,
        message: str,
        role: str,
        db: Session
    ) -> None:
        """
        Update customer memory with new message.
        """
        # This is handled by the chat API which creates messages
        # This method can be extended to update Redis cache or perform additional processing
        pass
    
    async def get_customer_preferences(
        self,
        customer_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Extract and return customer preferences based on conversation history.
        """
        messages = db.query(Message).join(Chat).filter(
            Chat.customer_id == customer_id
        ).order_by(Message.created_at.desc()).limit(50).all()
        
        preferences = {
            "preferred_products": [],
            "price_range": None,
            "communication_style": "formal",
            "last_interaction": None
        }
        
        # Analyze messages for preferences
        for msg in messages:
            if msg.role == "user" and msg.content:
                content = msg.content.lower()
                
                # Extract product mentions
                if "product" in content:
                    preferences["preferred_products"].append("product inquiry")
                
                # Extract price preferences
                if "cheap" in content or "affordable" in content:
                    preferences["price_range"] = "budget"
                elif "premium" in content or "expensive" in content:
                    preferences["price_range"] = "premium"
                
                if not preferences["last_interaction"]:
                    preferences["last_interaction"] = msg.created_at.isoformat() if msg.created_at else None
        
        return preferences
    
    async def clear_memory(
        self,
        customer_id: int,
        business_id: int,
        db: Session
    ) -> None:
        """
        Clear customer memory (useful for testing or privacy requests).
        """
        # In production, this might clear Redis cache
        # For now, this is a placeholder
        pass
    
    async def get_session_context(
        self,
        chat_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Get context for a specific chat session.
        """
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            return {}
        
        messages = db.query(Message).filter(
            Message.chat_id == chat_id
        ).order_by(Message.created_at.asc()).all()
        
        return {
            "chat_id": chat_id,
            "status": chat.status,
            "customer_id": chat.customer_id,
            "business_id": chat.business_id,
            "message_count": len(messages),
            "created_at": chat.created_at.isoformat() if chat.created_at else None,
            "updated_at": chat.updated_at.isoformat() if chat.updated_at else None
        }


memory_service = MemoryService()
