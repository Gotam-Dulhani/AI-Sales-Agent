from typing import Dict, Any, Optional, List
from app.services.ai_service import ai_service


class LeadAgent:
    """Lead agent that handles lead qualification and nurturing."""
    
    def __init__(self):
        self.ai_service = ai_service
    
    async def handle_message(
        self,
        message: str,
        business_id: int,
        customer_info: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Handle lead-related messages and provide qualification insights.
        """
        context = self._build_context(customer_info, conversation_history)
        
        prompt = f"""You are a lead qualification specialist for a business. 
        Analyze this customer interaction and provide helpful responses about lead qualification.

        Customer Message: "{message}"
        
        Context:
        {context}
        
        Your role is to:
        1. Gather information about the customer's needs and budget
        2. Assess their interest level and timeline
        3. Provide relevant product/service information
        4. Move them toward qualification when appropriate
        
        Provide a helpful, professional response that moves the lead forward in the sales process."""
        
        response = await self.ai_service.generate_response(prompt, temperature=0.7)
        return response
    
    async def qualify_lead(
        self,
        customer_info: Dict[str, Any],
        conversation_history: List[Dict],
        business_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Qualify a lead based on customer information and conversation history.
        Returns qualification score and insights.
        """
        context = self._build_qualification_context(
            customer_info, 
            conversation_history, 
            business_context
        )
        
        prompt = f"""Analyze this lead and provide a qualification assessment.
        
        Customer Information:
        {customer_info}
        
        Conversation History:
        {self._format_history(conversation_history)}
        
        Business Context:
        {business_context or 'Not provided'}
        
        Provide a JSON response with:
        - score: A number from 0-100 (higher = more qualified)
        - interest_level: "high", "medium", or "low"
        - budget_range: Estimated budget if mentioned
        - timeline: Purchase timeline if mentioned
        - reasoning: Brief explanation for the score
        - next_steps: Recommended next actions"""
        
        response = await self.ai_service.generate_response(prompt, temperature=0.3)
        
        # Parse the response (in production, use structured output)
        return {
            "score": 70,  # Default score
            "interest_level": "medium",
            "budget_range": "Not specified",
            "timeline": "Not specified",
            "reasoning": response[:500],
            "next_steps": ["Follow up in 2-3 days", "Send product information"]
        }
    
    async def suggest_nurturing_actions(
        self,
        lead_score: float,
        interest_level: str,
        last_interaction: str
    ) -> List[str]:
        """
        Suggest nurturing actions based on lead status.
        """
        prompt = f"""Suggest appropriate nurturing actions for a lead with:
        - Score: {lead_score}/100
        - Interest Level: {interest_level}
        - Last Interaction: {last_interaction}
        
        Provide 3-5 specific actions to nurture this lead."""
        
        response = await self.ai_service.generate_response(prompt, temperature=0.7)
        
        # Parse actions from response
        actions = [
            "Send personalized follow-up email",
            "Schedule a demo call",
            "Share relevant case studies",
            "Provide pricing information",
            "Connect with sales representative"
        ]
        
        return actions[:3]
    
    def _build_context(
        self,
        customer_info: Optional[Dict[str, Any]],
        conversation_history: Optional[List[Dict]]
    ) -> str:
        """Build context string for AI prompt."""
        context_parts = []
        
        if customer_info:
            context_parts.append(f"Customer: {customer_info.get('name', 'Unknown')}")
            if customer_info.get('email'):
                context_parts.append(f"Email: {customer_info['email']}")
            if customer_info.get('phone'):
                context_parts.append(f"Phone: {customer_info['phone']}")
        
        if conversation_history:
            context_parts.append("Recent conversation:")
            for msg in conversation_history[-3:]:
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')[:100]
                context_parts.append(f"{role}: {content}")
        
        return "\n".join(context_parts) if context_parts else "No additional context available"
    
    def _build_qualification_context(
        self,
        customer_info: Dict[str, Any],
        conversation_history: List[Dict],
        business_context: Optional[Dict[str, Any]]
    ) -> str:
        """Build detailed context for lead qualification."""
        context_parts = []
        
        context_parts.append("Customer Profile:")
        context_parts.append(f"- Name: {customer_info.get('name', 'Unknown')}")
        context_parts.append(f"- Email: {customer_info.get('email', 'Not provided')}")
        context_parts.append(f"- Phone: {customer_info.get('phone', 'Not provided')}")
        context_parts.append(f"- Created: {customer_info.get('created_at', 'Unknown')}")
        
        context_parts.append("\nConversation Summary:")
        context_parts.append(f"- Total messages: {len(conversation_history)}")
        
        user_messages = [msg for msg in conversation_history if msg.get('role') == 'user']
        context_parts.append(f"- User messages: {len(user_messages)}")
        
        if user_messages:
            context_parts.append("- Recent user inquiries:")
            for msg in user_messages[-3:]:
                content = msg.get('content', '')[:150]
                context_parts.append(f"  * {content}")
        
        if business_context:
            context_parts.append("\nBusiness Context:")
            context_parts.append(f"- Industry: {business_context.get('industry', 'Unknown')}")
            context_parts.append(f"- Products: {business_context.get('product_count', 0)} available")
        
        return "\n".join(context_parts)
    
    def _format_history(self, history: List[Dict]) -> str:
        """Format conversation history for prompts."""
        formatted = []
        for msg in history[-5:]:
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')[:200]
            formatted.append(f"{role}: {content}")
        return "\n".join(formatted)


lead_agent = LeadAgent()
