from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.document import DocumentType, DocumentStatus


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: DocumentType = DocumentType.PDF


class DocumentCreate(DocumentBase):
    business_id: int


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    document_type: Optional[DocumentType] = None
    status: Optional[DocumentStatus] = None


class DocumentInDB(DocumentBase):
    id: int
    business_id: int
    file_path: Optional[str] = None
    status: DocumentStatus
    chunk_count: int
    qdrant_collection: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Document(DocumentInDB):
    pass
