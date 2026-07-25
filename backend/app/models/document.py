from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class DocumentType(str, enum.Enum):
    PDF = "pdf"
    FAQ = "faq"
    POLICY = "policy"
    MANUAL = "manual"


class DocumentStatus(str, enum.Enum):
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String)
    document_type = Column(SQLEnum(DocumentType), default=DocumentType.PDF)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PROCESSING)
    chunk_count = Column(Integer, default=0)
    qdrant_collection = Column(String)  # Name of the Qdrant collection
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="documents")
