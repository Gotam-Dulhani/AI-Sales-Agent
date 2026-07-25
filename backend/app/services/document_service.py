from typing import List, Optional
import aiofiles
import os
from app.services.rag_service import rag_service
from app.core.config import settings


class DocumentService:
    def __init__(self):
        self.rag_service = rag_service
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file to disk."""
        file_path = os.path.join(self.upload_dir, filename)
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        return file_path

    async def process_pdf(self, file_path: str) -> List[str]:
        """Extract text from PDF and chunk it."""
        try:
            from pypdf import PdfReader
            
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            
            # Simple chunking (can be improved with more sophisticated methods)
            chunks = self.chunk_text(text, chunk_size=1000, overlap=200)
            return chunks
        except Exception as e:
            print(f"Error processing PDF: {str(e)}")
            return []

    async def process_text(self, file_path: str) -> List[str]:
        """Extract text from text file and chunk it."""
        try:
            async with aiofiles.open(file_path, 'r') as f:
                text = await f.read()
            
            chunks = self.chunk_text(text, chunk_size=1000, overlap=200)
            return chunks
        except Exception as e:
            print(f"Error processing text file: {str(e)}")
            return []

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap."""
        if chunk_size <= overlap:
            return [text] if text else []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
        
        return chunks

    async def index_document(
        self,
        document_id: int,
        file_path: str,
        collection_name: str,
        metadata: dict
    ) -> bool:
        """Process and index a document."""
        # Determine file type and process
        if file_path.endswith('.pdf'):
            chunks = await self.process_pdf(file_path)
        elif file_path.endswith('.txt'):
            chunks = await self.process_text(file_path)
        else:
            return False
        
        if not chunks:
            return False
        
        # Index using RAG service
        return await self.rag_service.index_document(
            document_id=document_id,
            chunks=chunks,
            metadata=metadata,
            collection_name=collection_name
        )


document_service = DocumentService()
