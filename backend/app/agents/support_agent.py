from typing import Dict, Any, Optional
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service


class SupportAgent:
    """Support agent for customer service inquiries."""
    
    def __init__(self):
        self.ai_service = ai_service
        self.rag_service = rag_service

    async def handle_message(
        self,
        message: str,
        business_id: int,
        collection_name: str,
        customer_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Handle a support-related message using RAG.
        """
        # First, try to find relevant information in the knowledge base
        rag_response = await self.rag_service.generate_response_with_rag(
            query=message,
            collection_name=collection_name,
            business_context=customer_context.get('business_name') if customer_context else None
        )
        
        return rag_response

    async def handle_faq(
        self,
        message: str,
        business_id: int,
        collection_name: str
    ) -> str:
        """
        Handle FAQ-style queries.
        """
        # Search for FAQ entries
        search_results = await self.rag_service.search_knowledge_base(
            query=message,
            collection_name=collection_name,
            limit=3
        )
        
        if search_results:
            # Use the most relevant FAQ
            best_match = search_results[0]
            return best_match.get('payload', {}).get('text', "I could not find a specific answer to your question.")
        
        # Fallback to general AI response
        newline = "\n"
        prompt = f"""
        You are a customer support assistant. Answer this customer question helpfully.{newline}
        Customer Question: {message}{newline}
        If you do not know the answer, politely suggest they contact a human agent.
        """
        return await self.ai_service.generate_response(prompt)


support_agent = SupportAgent()
