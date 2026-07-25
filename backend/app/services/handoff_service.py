from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.chat import Chat, ChatStatus
from app.models.user import User
from app.services.memory_service import memory_service


class HandoffService:
    """Service for managing human handoff from AI agents."""
    
    def __init__(self):
        self.handoff_triggers = [
            "complex issue",
            "speak to human",
            "talk to person",
            "representative",
            "agent",
            "manager",
            "complaint",
            "refund",
            "legal",
            "emergency"
        ]
    
    async def should_handoff(
        self,
        message: str,
        chat_id: int,
        db: Session
    ) -> tuple[bool, str]:
        """
        Determine if a conversation should be handed off to a human.
        Returns (should_handoff, reason)
        """
        message_lower = message.lower()
        
        # Check for explicit handoff requests
        for trigger in self.handoff_triggers:
            if trigger in message_lower:
                return True, f"Customer mentioned: '{trigger}'"
        
        # Check for repeated frustration
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            from app.models.message import Message
            messages = db.query(Message).filter(
                Message.chat_id == chat_id,
                Message.role == "user"
            ).order_by(Message.created_at.desc()).limit(5).all()
            
            # Check if user is repeating similar messages
            if len(messages) >= 3:
                recent_contents = [msg.content.lower() for msg in messages[:3]]
                if len(set(recent_contents)) == 1:
                    return True, "Customer repeating the same message"
        
        return False, ""
    
    async def initiate_handoff(
        self,
        chat_id: int,
        db: Session,
        assigned_to: Optional[int] = None,
        reason: str = ""
    ) -> Dict[str, Any]:
        """
        Initiate handoff from AI to human agent.
        """
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise ValueError("Chat not found")
        
        # Update chat status
        chat.status = ChatStatus.HANDED_OVER
        chat.assigned_agent = "human"
        
        db.commit()
        db.refresh(chat)
        
        # Get conversation context for the human agent
        context = await memory_service.get_session_context(chat_id, db)
        customer_memory = await memory_service.get_customer_memory(
            chat.customer_id,
            chat.business_id,
            db
        )
        
        return {
            "chat_id": chat_id,
            "status": "handed_over",
            "assigned_to": assigned_to,
            "reason": reason,
            "context": context,
            "customer_memory": customer_memory,
            "timestamp": chat.updated_at.isoformat() if chat.updated_at else None
        }
    
    async def assign_to_agent(
        self,
        chat_id: int,
        agent_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Assign a handed-off chat to a specific human agent.
        """
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise ValueError("Chat not found")
        
        agent = db.query(User).filter(User.id == agent_id).first()
        
        if not agent:
            raise ValueError("Agent not found")
        
        chat.assigned_agent = f"human:{agent_id}"
        
        db.commit()
        db.refresh(chat)
        
        return {
            "chat_id": chat_id,
            "assigned_to": agent_id,
            "agent_name": agent.email,
            "status": chat.status.value
        }
    
    async def return_to_ai(
        self,
        chat_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Return a chat from human agent back to AI.
        """
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise ValueError("Chat not found")
        
        chat.status = ChatStatus.ACTIVE
        chat.assigned_agent = "manager"  # Return to manager agent
        
        db.commit()
        db.refresh(chat)
        
        return {
            "chat_id": chat_id,
            "status": "active",
            "assigned_agent": "manager",
            "timestamp": chat.updated_at.isoformat() if chat.updated_at else None
        }
    
    async def get_active_handoffs(
        self,
        business_id: int,
        db: Session
    ) -> list:
        """
        Get all chats currently handed off to humans for a business.
        """
        chats = db.query(Chat).filter(
            Chat.business_id == business_id,
            Chat.status == ChatStatus.HANDED_OVER
        ).all()
        
        result = []
        for chat in chats:
            result.append({
                "chat_id": chat.id,
                "customer_id": chat.customer_id,
                "assigned_agent": chat.assigned_agent,
                "last_message_at": chat.last_message_at.isoformat() if chat.last_message_at else None,
                "created_at": chat.created_at.isoformat() if chat.created_at else None
            })
        
        return result


handoff_service = HandoffService()
