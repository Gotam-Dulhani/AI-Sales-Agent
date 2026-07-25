from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.chat import ChatStatus


class MessageCreate(BaseModel):
    content: str
    meta_data: Optional[str] = None


class MessageInDB(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    agent_used: Optional[str] = None
    meta_data: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Message(MessageInDB):
    pass


class ChatBase(BaseModel):
    business_id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    status: ChatStatus = ChatStatus.ACTIVE


class ChatCreate(ChatBase):
    pass


class ChatUpdate(BaseModel):
    status: Optional[ChatStatus] = None
    assigned_agent: Optional[str] = None


class ChatInDB(BaseModel):
    id: int
    business_id: int
    customer_id: int
    status: ChatStatus
    assigned_agent: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Chat(ChatInDB):
    messages: Optional[List[Message]] = []
