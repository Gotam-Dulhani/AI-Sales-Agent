import asyncio
import re
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

_groq_key = settings.GROQ_API_KEY
_gemini_model = None

if _groq_key:
    print("Groq AI initialized with API key")

try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        print("Gemini AI initialized as fallback")
except Exception as e:
    print(f"Gemini AI unavailable: {e}")


class AIService:
    def __init__(self):
        self.groq_key = _groq_key
        self.gemini_model = _gemini_model

    async def _groq_chat(self, messages, temperature=0.7, max_tokens=1000) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def _gemini_chat(self, prompt, temperature=0.7, max_tokens=1000) -> str:
        import google.generativeai as genai
        response = await asyncio.to_thread(
            self.gemini_model.generate_content,
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return response.text

    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        full_prompt = prompt
        if context:
            full_prompt = f"Context:\n{context}\n\nQuestion:\n{prompt}"

        if self.groq_key:
            try:
                return await self._groq_chat(
                    [{"role": "user", "content": full_prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception as e:
                print(f"Groq API error: {e}")

        if self.gemini_model:
            try:
                return await self._gemini_chat(full_prompt, temperature, max_tokens)
            except Exception as e:
                print(f"Gemini API error: {e}")

        return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["hello", "hi", "hey", "salam", "assalam"]):
            return "Hello! Welcome. How can I assist you today?"
        if any(w in prompt_lower for w in ["price", "cost", "how much", "rate"]):
            return "I can help you with pricing. Could you tell me which product you are interested in? I will check the latest prices for you."
        if any(w in prompt_lower for w in ["deliver", "shipping", "track", "order"]):
            return "I can help with order and delivery inquiries. Could you provide your order number so I can look up the status?"
        if any(w in prompt_lower for w in ["return", "refund", "exchange", "complaint"]):
            return "I understand your concern. Let me connect you with a support representative who can help with this."
        if any(w in prompt_lower for w in ["recommend", "suggest", "best", "which"]):
            return "I would be happy to help you find the right product. Could you share more details about what you are looking for?"
        return "Thank you for your message. I am here to help. Could you provide a bit more detail so I can assist you better?"

    async def classify_intent(self, message: str) -> str:
        if self.groq_key:
            try:
                result = await self._groq_chat(
                    [
                        {"role": "system", "content": "You are an intent classifier. Classify the customer message into exactly one category: sales, support, order, or lead. Return ONLY the category name."},
                        {"role": "user", "content": message},
                    ],
                    temperature=0.1,
                    max_tokens=10,
                )
                result = result.lower().strip().strip('"').strip("'").split()[0] if result.strip() else ""
                if result in ["sales", "support", "order", "lead"]:
                    return result
            except Exception as e:
                print(f"Groq classify error: {e}")

        if self.gemini_model:
            try:
                prompt = f"""Classify the following customer message into one of these categories:
- sales: Product inquiries, recommendations, pricing
- support: Customer service, complaints, general questions
- order: Order tracking, order modifications, delivery
- lead: Potential new customer, qualification

Message: "{message}"

Return only the category name (sales, support, order, or lead)."""
                result = await self._gemini_chat(prompt, temperature=0.1)
                result = result.lower().strip().strip('"').strip("'")
                if result in ["sales", "support", "order", "lead"]:
                    return result
            except Exception:
                pass

        return self._fallback_classify(message)

    def _fallback_classify(self, message: str) -> str:
        msg = message.lower()
        order_keywords = ["order", "track", "delivery", "shipping", "shipped", "delivered", "where is my"]
        sales_keywords = ["buy", "price", "cost", "product", "recommend", "suggest", "laptop", "phone", "discount", "offer", "under", "budget"]
        lead_keywords = ["new", "interested", "looking for", "tell me about", "information", "details"]
        support_keywords = ["help", "problem", "issue", "complaint", "refund", "return", "broken", "error"]

        scores = {
            "order": sum(1 for k in order_keywords if k in msg),
            "sales": sum(1 for k in sales_keywords if k in msg),
            "lead": sum(1 for k in lead_keywords if k in msg),
            "support": sum(1 for k in support_keywords if k in msg),
        }

        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else "support"

    async def extract_entities(self, message: str) -> Dict[str, Any]:
        entities: Dict[str, Any] = {}
        price_match = re.search(r'(\d[\d,]*)\s*(?:pkr|rs|inr|\$|usd)?', message.lower())
        if price_match:
            entities["price_range"] = price_match.group(1).replace(",", "")
        order_match = re.search(r'(?:order|#)\s*(\d+)', message, re.IGNORECASE)
        if order_match:
            entities["order_number"] = order_match.group(1)
        phone_match = re.search(r'(\d{10,12})', message)
        if phone_match:
            entities["phone_number"] = phone_match.group(1)
        return entities


ai_service = AIService()
