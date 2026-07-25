from typing import List
import hashlib
from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        # Using a simple hash-based embedding approach (no heavy ML dependencies)
        # This is a simplified approach that works without sentence-transformers
        self.embedding_dim = 128  # Fixed dimension for our simple embeddings

    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding for a text string using hash-based approach."""
        try:
            # Create a simple hash-based embedding
            # This is not as sophisticated as ML embeddings but works without heavy dependencies
            text_bytes = text.encode('utf-8')
            hash_obj = hashlib.sha256(text_bytes)
            hash_hex = hash_obj.hexdigest()
            
            # Convert hash to numeric values
            embedding = []
            for i in range(0, len(hash_hex), 2):
                byte_val = int(hash_hex[i:i+2], 16)
                normalized = byte_val / 255.0
                embedding.append(normalized)
            
            # Pad or truncate to target dimension
            if len(embedding) < self.embedding_dim:
                embedding = embedding + [0.0] * (self.embedding_dim - len(embedding))
            else:
                embedding = embedding[:self.embedding_dim]
            
            return embedding
        except Exception as e:
            raise Exception(f"Error generating embedding: {str(e)}")

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for multiple texts."""
        embeddings = []
        for text in texts:
            embedding = await self.get_embedding(text)
            embeddings.append(embedding)
        return embeddings

    def get_embedding_dimension(self) -> int:
        """Return the dimension of embeddings."""
        return self.embedding_dim


embedding_service = EmbeddingService()
