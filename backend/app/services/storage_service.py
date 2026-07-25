import os
from typing import Optional, BinaryIO
from supabase import create_client, Client
from app.core.config import settings


class StorageService:
    """Service for managing file storage using Supabase Storage."""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.bucket_name = settings.SUPABASE_BUCKET
        self._connect()
    
    def _connect(self):
        """Connect to Supabase Storage."""
        try:
            if settings.SUPABASE_URL and settings.SUPABASE_KEY:
                self.client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                print("Connected to Supabase Storage")
            else:
                print("Warning: Supabase credentials not provided. Storage will be disabled.")
        except Exception as e:
            print(f"Warning: Could not connect to Supabase Storage: {e}")
            print("Storage will be disabled")
    
    def upload_file(
        self,
        file_path: str,
        file_data: BinaryIO,
        content_type: str,
        business_id: int
    ) -> Optional[str]:
        """
        Upload a file to Supabase Storage.
        Returns the public URL of the uploaded file.
        """
        if not self.client:
            print("Storage not available")
            return None
        
        try:
            # Generate a unique file path
            file_name = os.path.basename(file_path)
            storage_path = f"{business_id}/{file_name}"
            
            # Upload file
            self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_data,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
            return public_url
            
        except Exception as e:
            print(f"Error uploading file to Supabase: {e}")
            return None
    
    def upload_document(
        self,
        file_data: BinaryIO,
        filename: str,
        content_type: str,
        business_id: int,
        document_id: int
    ) -> Optional[str]:
        """
        Upload a document file to Supabase Storage.
        Returns the public URL of the uploaded document.
        """
        if not self.client:
            print("Storage not available")
            return None
        
        try:
            # Generate a structured file path
            file_extension = os.path.splitext(filename)[1]
            storage_path = f"businesses/{business_id}/documents/{document_id}{file_extension}"
            
            # Upload file
            self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_data,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
            return public_url
            
        except Exception as e:
            print(f"Error uploading document to Supabase: {e}")
            return None
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from Supabase Storage."""
        if not self.client:
            return False
        
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file from Supabase: {e}")
            return False
    
    def get_file_url(self, file_path: str) -> Optional[str]:
        """Get the public URL of a file."""
        if not self.client:
            return None
        
        try:
            return self.client.storage.from_(self.bucket_name).get_public_url(file_path)
        except Exception as e:
            print(f"Error getting file URL from Supabase: {e}")
            return None
    
    def list_files(self, business_id: int, prefix: str = "") -> list:
        """List files in a business's storage."""
        if not self.client:
            return []
        
        try:
            folder_path = f"businesses/{business_id}/{prefix}"
            result = self.client.storage.from_(self.bucket_name).list(path=folder_path)
            return result
        except Exception as e:
            print(f"Error listing files from Supabase: {e}")
            return []
    
    def download_file(self, file_path: str) -> Optional[bytes]:
        """Download a file from Supabase Storage."""
        if not self.client:
            return None
        
        try:
            result = self.client.storage.from_(self.bucket_name).download(path=file_path)
            return result
        except Exception as e:
            print(f"Error downloading file from Supabase: {e}")
            return None
    
    def create_bucket(self, bucket_name: str, public: bool = False) -> bool:
        """Create a new storage bucket."""
        if not self.client:
            return False
        
        try:
            self.client.storage.create_bucket(
                id=bucket_name,
                options={"public": public}
            )
            return True
        except Exception as e:
            print(f"Error creating bucket in Supabase: {e}")
            return False
    
    def delete_bucket(self, bucket_name: str) -> bool:
        """Delete a storage bucket."""
        if not self.client:
            return False
        
        try:
            self.client.storage.delete_bucket(bucket_name)
            return True
        except Exception as e:
            print(f"Error deleting bucket from Supabase: {e}")
            return False
    
    def is_available(self) -> bool:
        """Check if storage service is available."""
        return self.client is not None


storage_service = StorageService()
