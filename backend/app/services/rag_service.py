from typing import List, Dict, Any, Optional
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.ai_service import ai_service


class RAGService:
    def __init__(self):
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service
        self.ai_service = ai_service

    async def search_knowledge_base(
        self,
        query: str,
        collection_name: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base for relevant information."""
        # Get embedding for the query
        query_embedding = await self.embedding_service.get_embedding(query)
        
        # Search Qdrant
        results = await self.qdrant_service.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit
        )
        
        return results

    async def generate_response_with_rag(
        self,
        query: str,
        collection_name: str,
        business_context: Optional[str] = None
    ) -> str:
        """Generate a response using RAG (Retrieval-Augmented Generation)."""
        # Search for relevant documents
        search_results = await self.search_knowledge_base(query, collection_name)
        
        # Build context from search results
        context_parts = []
        for result in search_results:
            if result.get("payload"):
                context_parts.append(result["payload"].get("text", ""))
        
        context = "\n\n".join(context_parts) if context_parts else "No relevant information found."
        
        # Generate response with context
        prompt = f"""
        You are a helpful customer support assistant for a business.
        Use the following context to answer the customer's question.
        
        Context:
        {context}
        
        {f"Business Context: {business_context}" if business_context else ""}
        
        Customer Question: {query}
        
        Provide a helpful, friendly response. If the answer is not in the context, say so politely.
        """
        
        return await self.ai_service.generate_response(prompt)

    async def index_document(
        self,
        document_id: int,
        chunks: List[str],
        metadata: Dict[str, Any],
        collection_name: str
    ) -> bool:
        """Index document chunks into Qdrant."""
        from qdrant_client.models import PointStruct
        
        # Get embeddings for all chunks
        embeddings = await self.embedding_service.get_embeddings(chunks)
        
        # Create points for Qdrant
        points = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point = PointStruct(
                id=document_id * 10000 + i,
                vector=embedding,
                payload={
                    "text": chunk,
                    "document_id": document_id,
                    "chunk_index": i,
                    **metadata
                }
            )
            points.append(point)
        
        # Upsert to Qdrant
        return await self.qdrant_service.upsert_points(collection_name, points)

    async def create_business_collection(self, business_id: int) -> bool:
        """Create a Qdrant collection for a business with correct vector size."""
        collection_name = f"business_{business_id}"
        vector_size = self.embedding_service.get_embedding_dimension()
        return await self.qdrant_service.create_collection(collection_name, vector_size)


rag_service = RAGService()
