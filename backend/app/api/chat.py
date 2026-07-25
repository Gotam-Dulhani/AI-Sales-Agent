from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.chat import ChatCreate, Chat as ChatSchema, MessageCreate, Message as MessageSchema
from app.api.deps import get_current_active_user
from app.agents.manager_agent import manager_agent
from app.agents.sales_agent import sales_agent
from app.agents.support_agent import support_agent
from app.agents.order_agent import order_agent
from app.agents.lead_agent import lead_agent
from app.services.handoff_service import handoff_service

router = APIRouter()


@router.post("/chats", response_model=ChatSchema)
async def create_chat(
    chat_in: ChatCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new chat."""
    customer_id = chat_in.customer_id

    if not customer_id and (chat_in.customer_name or chat_in.customer_phone or chat_in.customer_email):
        customer = None
        if chat_in.customer_phone:
            customer = db.query(Customer).filter(
                Customer.phone == chat_in.customer_phone,
                Customer.business_id == chat_in.business_id,
            ).first()
        if not customer and chat_in.customer_email:
            customer = db.query(Customer).filter(
                Customer.email == chat_in.customer_email,
                Customer.business_id == chat_in.business_id,
            ).first()
        if not customer:
            customer = Customer(
                name=chat_in.customer_name,
                phone=chat_in.customer_phone,
                email=chat_in.customer_email,
                business_id=chat_in.business_id,
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        customer_id = customer.id

    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id or customer_name is required")

    chat = Chat(
        business_id=chat_in.business_id,
        customer_id=customer_id,
        status=chat_in.status,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return chat


@router.get("/chats", response_model=List[ChatSchema])
async def get_chats(
    business_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chats for a business."""
    chats = db.query(Chat).filter(Chat.business_id == business_id).all()
    return chats


@router.post("/chats/{chat_id}/messages", response_model=MessageSchema)
async def send_message(
    chat_id: int,
    message_in: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response."""
    # Get chat
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=message_in.content,
        meta_data=message_in.meta_data
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    conversation_history = [{"role": m.role, "content": m.content} for m in messages]
    
    # Check if should handoff to human
    should_handoff, handoff_reason = await handoff_service.should_handoff(
        message_in.content,
        chat_id,
        db
    )
    
    if should_handoff:
        # Send handoff message
        ai_message = Message(
            chat_id=chat_id,
            role="assistant",
            content="I'm connecting you with a human agent who can better assist you.",
            agent_used="manager"
        )
        db.add(ai_message)
        db.commit()
        
        # Initiate handoff after saving message
        await handoff_service.initiate_handoff(
            chat_id=chat_id,
            db=db,
            reason=handoff_reason
        )
        
        db.refresh(ai_message)
        return ai_message
    
    # Route to appropriate agent
    agent_type = await manager_agent.route_message(message_in.content)
    chat.assigned_agent = agent_type
    
    # Get context based on agent type
    response = ""
    if agent_type == "sales":
        # Get products for the business
        from app.models.product import Product
        products = db.query(Product).filter(
            Product.business_id == chat.business_id,
            Product.status == "active"
        ).all()
        product_dicts = [{"id": p.id, "name": p.name, "price": p.price, 
                         "description": p.description, "category": p.category} 
                        for p in products]
        
        response = await sales_agent.handle_message(
            message_in.content,
            chat.business_id,
            products=product_dicts
        )
    elif agent_type == "support":
        # Get business for collection name
        from app.models.business import Business
        business = db.query(Business).filter(Business.id == chat.business_id).first()
        collection_name = f"business_{chat.business_id}"
        
        response = await support_agent.handle_message(
            message_in.content,
            chat.business_id,
            collection_name
        )
    elif agent_type == "order":
        # Get customer orders
        orders = db.query(Order).filter(
            Order.customer_id == chat.customer_id,
            Order.business_id == chat.business_id
        ).all()
        order_dicts = [{"order_number": o.order_number, "status": o.status.value if hasattr(o.status, 'value') else str(o.status),
                        "total": o.total, "created_at": str(o.created_at) if o.created_at else "N/A",
                        "tracking_number": o.tracking_number,
                        "estimated_delivery": o.estimated_delivery.strftime('%Y-%m-%d') if o.estimated_delivery else None} 
                       for o in orders]
        
        response = await order_agent.handle_message(
            message_in.content,
            customer_orders=order_dicts
        )
    elif agent_type == "lead":
        # Get customer information for lead qualification
        customer = db.query(Customer).filter(Customer.id == chat.customer_id).first()
        customer_info = {
            "name": customer.name if customer else "Unknown",
            "email": customer.email if customer else None,
            "phone": customer.phone if customer else None,
            "created_at": customer.created_at.isoformat() if customer and customer.created_at else None
        }
        
        response = await lead_agent.handle_message(
            message_in.content,
            chat.business_id,
            customer_info=customer_info,
            conversation_history=conversation_history
        )
    else:
        # Default to support
        response = await support_agent.handle_message(
            message_in.content,
            chat.business_id,
            f"business_{chat.business_id}"
        )
    
    # Save AI response
    ai_message = Message(
        chat_id=chat_id,
        role="assistant",
        content=response,
        agent_used=agent_type
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    # Update chat last message time
    chat.last_message_at = datetime.now(timezone.utc)
    db.commit()
    
    return ai_message


@router.get("/chats/{chat_id}/messages", response_model=List[MessageSchema])
async def get_messages(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all messages for a chat."""
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    return messages


@router.post("/chats/{chat_id}/handoff")
async def initiate_handoff(
    chat_id: int,
    assigned_to: int = None,
    reason: str = "",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initiate handoff from AI to human agent."""
    try:
        result = await handoff_service.initiate_handoff(
            chat_id=chat_id,
            db=db,
            assigned_to=assigned_to,
            reason=reason
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/chats/{chat_id}/assign")
async def assign_to_agent(
    chat_id: int,
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Assign a handed-off chat to a specific human agent."""
    try:
        result = await handoff_service.assign_to_agent(
            chat_id=chat_id,
            agent_id=agent_id,
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/chats/{chat_id}/return-to-ai")
async def return_to_ai(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Return a chat from human agent back to AI."""
    try:
        result = await handoff_service.return_to_ai(
            chat_id=chat_id,
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/chats/handoffs")
async def get_active_handoffs(
    business_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chats currently handed off to humans for a business."""
    result = await handoff_service.get_active_handoffs(
        business_id=business_id,
        db=db
    )
    return result
