from typing import Dict, Any, Optional
from app.services.ai_service import ai_service


class ManagerAgent:
    """Manager agent that routes messages to specialized agents."""
    
    def __init__(self):
        self.ai_service = ai_service

    async def route_message(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Route the message to the appropriate specialized agent.
        Returns the agent type: 'sales', 'support', 'order', or 'lead'
        """
        intent = await self.ai_service.classify_intent(message)
        
        # Normalize the intent
        intent = intent.lower().strip()
        
        if intent in ['sales', 'support', 'order', 'lead']:
            return intent
        
        # Default to support if classification fails
        return 'support'

    async def should_handoff_to_human(
        self,
        message: str,
        conversation_history: list
    ) -> bool:
        """
        Determine if the conversation should be handed off to a human.
        """
        prompt = f"""
        Analyze this customer message and conversation history to determine if it should be handed off to a human agent.
        
        Message: "{message}"
        
        Conversation history:
        {self._format_history(conversation_history)}
        
        Return "YES" if any of these conditions are met:
        - Customer is angry or frustrated
        - Customer is asking for a human
        - The issue is too complex for AI
        - Customer has asked the same question multiple times without satisfaction
        - Legal or sensitive matters
        
        Otherwise return "NO".
        """
        
        response = await self.ai_service.generate_response(prompt, temperature=0.3)
        return "YES" in response.upper()

    def _format_history(self, history: list) -> str:
        """Format conversation history for the prompt."""
        formatted = []
        for msg in history[-5:]:  # Last 5 messages
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            formatted.append(f"{role}: {content}")
        newline = "\n"
        return newline.join(formatted)


manager_agent = ManagerAgent()
