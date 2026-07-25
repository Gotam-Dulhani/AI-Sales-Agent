import asyncio
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from app.core.config import settings


class QdrantService:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        return self._client

    async def create_collection(
        self,
        collection_name: str,
        vector_size: int = 128,
        distance: Distance = Distance.COSINE
    ) -> bool:
        """Create a new Qdrant collection."""
        try:
            await asyncio.to_thread(
                self.client.create_collection,
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=distance)
            )
            return True
        except Exception as e:
            print(f"Error creating collection: {str(e)}")
            return False

    async def delete_collection(self, collection_name: str) -> bool:
        """Delete a Qdrant collection."""
        try:
            await asyncio.to_thread(
                self.client.delete_collection,
                collection_name=collection_name
            )
            return True
        except Exception as e:
            print(f"Error deleting collection: {str(e)}")
            return False

    async def upsert_points(
        self,
        collection_name: str,
        points: List[PointStruct]
    ) -> bool:
        """Upsert points to a collection."""
        try:
            await asyncio.to_thread(
                self.client.upsert,
                collection_name=collection_name,
                points=points
            )
            return True
        except Exception as e:
            print(f"Error upserting points: {str(e)}")
            return False

    async def search(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.7,
        filter: Optional[Filter] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors in a collection."""
        try:
            results = await asyncio.to_thread(
                self.client.search,
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=filter
            )
            
            return [
                {
                    "id": hit.id,
                    "score": hit.score,
                    "payload": hit.payload
                }
                for hit in results
            ]
        except Exception as e:
            print(f"Error searching: {str(e)}")
            return []

    async def get_collection_info(self, collection_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a collection."""
        try:
            info = await asyncio.to_thread(
                self.client.get_collection,
                collection_name=collection_name
            )
            return {
                "name": info.config.params.vectors.size,
                "vectors_count": info.points_count,
                "status": info.status
            }
        except Exception as e:
            print(f"Error getting collection info: {str(e)}")
            return None


qdrant_service = QdrantService()
