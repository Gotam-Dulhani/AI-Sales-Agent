from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentCreate, Document as DocumentSchema, DocumentUpdate
from app.api.deps import get_current_active_user
from app.services.document_service import document_service
from app.services.rag_service import rag_service
from app.services.storage_service import storage_service
import os

router = APIRouter()


@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    business_id: int,
    title: str,
    description: str = None,
    document_type: str = "pdf",
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload and process a document."""
    # Save file
    file_content = await file.read()
    filename = f"{business_id}_{file.filename}"
    
    # Try to upload to Supabase Storage first, fall back to local storage
    file_path = None
    storage_url = None
    if storage_service.is_available():
        from io import BytesIO
        file_buffer = BytesIO(file_content)
        file_buffer.seek(0)
        
        storage_url = storage_service.upload_document(
            file_data=file_buffer,
            filename=filename,
            content_type=file.content_type or "application/pdf",
            business_id=business_id,
            document_id=0  # Will be updated after document creation
        )
        
        if storage_url:
            file_path = storage_url
            # Also save locally for RAG processing
            local_path = await document_service.save_file(file_content, filename)
        else:
            # Fall back to local storage only
            file_path = await document_service.save_file(file_content, filename)
    else:
        # Use local storage
        file_path = await document_service.save_file(file_content, filename)
    
    # Create document record
    document = Document(
        business_id=business_id,
        title=title,
        description=description,
        file_path=file_path,
        document_type=document_type,
        status="processing"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Update Supabase storage path with document ID if using cloud storage
    if storage_service.is_available() and storage_url:
        from io import BytesIO
        file_buffer = BytesIO(file_content)
        file_buffer.seek(0)
        
        updated_url = storage_service.upload_document(
            file_data=file_buffer,
            filename=filename,
            content_type=file.content_type or "application/pdf",
            business_id=business_id,
            document_id=document.id
        )
        
        if updated_url:
            document.file_path = updated_url
            db.commit()
    
    # Create Qdrant collection for this business with correct vector size
    collection_name = f"business_{business_id}"
    await rag_service.create_business_collection(business_id)
    
    # Process and index document (in background in production)
    try:
        # Use local path for RAG processing
        local_path = await document_service.save_file(file_content, filename)
        
        chunks = await document_service.index_document(
            document_id=document.id,
            file_path=local_path,
            collection_name=collection_name,
            metadata={"title": title, "business_id": business_id}
        )
        
        if chunks:
            document.status = "ready"
            document.chunk_count = len(chunks)
            document.qdrant_collection = collection_name
        else:
            document.status = "failed"
        
        db.commit()
        db.refresh(document)
    except Exception as e:
        document.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
    
    return document


@router.get("/", response_model=List[DocumentSchema])
async def get_documents(
    business_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all documents for a business."""
    documents = db.query(Document).filter(Document.business_id == business_id).all()
    return documents


@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific document by ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a document."""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file
    if document.file_path and os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
