# Free API Keys Setup Guide

This guide will help you set up free API keys for the AI Sales Agent Platform.

## Required Free API Keys

### 1. Mistral AI (Required - Free Tier)

Mistral AI offers a generous free tier for their LLM API.

**Steps to get your API key:**

1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key

**Free Tier Limits:**
- Mistral Tiny model: Free with generous rate limits
- Mistral Small model: Limited free credits
- Mistral Medium model: Limited free credits

**Add to `.env`:**
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 2. Hugging Face (Optional - Free)

Hugging Face provides free access to thousands of models including sentence-transformers for embeddings.

**Steps to get your API key:**

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "read" permissions
5. Copy the token

**Note:** The sentence-transformers model (`all-MiniLM-L6-v2`) used in this project can be used without an API key as it runs locally. However, having an API key allows access to additional models and features.

**Add to `.env` (optional):**
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 3. Google Gemini (Optional - Free Tier)

Google Gemini API has a free tier that can be used as an alternative to Mistral AI.

**Steps to get your API key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

**Free Tier Limits:**
- 60 requests per minute
- Generous daily quota

**Add to `.env` (optional):**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Configuration

### Update `.env` File

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual API keys:

```bash
# Required
MISTRAL_API_KEY=your_actual_mistral_api_key

# Optional
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Update `docker-compose.yml`

The environment variables in `docker-compose.yml` will automatically pick up your `.env` file. Make sure your `.env` file is in the root directory of the project.

## Testing Your API Keys

### Test Mistral AI

```bash
cd backend
python -c "
from mistralai.client import MistralClient
import os

client = MistralClient(api_key=os.getenv('MISTRAL_API_KEY'))
response = client.chat(
    model='mistral-tiny',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(response.choices[0].message.content)
"
```

### Test Hugging Face Embeddings

```bash
cd backend
python -c "
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode('Hello world!')
print(f'Embedding dimension: {len(embedding)}')
"
```

## Cost Summary

| Service | Cost | Usage in Project |
|---------|------|------------------|
| Mistral AI | Free tier available | LLM for chat responses |
| Hugging Face | Free (local models) | Text embeddings |
| Qdrant | Free (self-hosted) | Vector database |
| PostgreSQL | Free (self-hosted) | Primary database |
| Redis | Free (self-hosted) | Caching |

**Total Cost:** $0/month (using free tiers and self-hosted services)

## Alternative Free Options

If you need alternatives, consider these free AI APIs:

### 1. Groq AI
- Very fast inference
- Free tier available
- Supports multiple models (Llama, Mixtral)

### 2. Together AI
- Free credits for new users
- Multiple open-source models
- Good performance

### 3. Replicate
- Free tier for testing
- Hosts many open-source models
- Pay-per-use after free tier

### 4. Local LLMs (Ollama)
- Completely free
- Runs locally on your machine
- Requires good hardware
- Models: Llama 2, Mistral, etc.

To use Ollama instead of cloud APIs:
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull mistral`
3. Use the Ollama Python library instead of Mistral AI client

## Troubleshooting

### Mistral AI API Errors

**Error:** "Invalid API key"
- **Solution:** Verify your API key is correct and has no extra spaces

**Error:** "Rate limit exceeded"
- **Solution:** You've hit the free tier limits. Wait a few minutes or upgrade to paid tier

### Hugging Face Model Download Issues

**Error:** "Model download failed"
- **Solution:** The model will download automatically on first run. Ensure you have internet connection and sufficient disk space (~500MB for all-MiniLM-L6-v2)

### Embedding Dimension Mismatch

**Error:** "Vector dimension mismatch"
- **Solution:** The project now uses 384 dimensions (all-MiniLM-L6-v2). If you have existing Qdrant collections with different dimensions, you'll need to delete and recreate them.

## Security Best Practices

1. **Never commit `.env` file to version control**
2. **Rotate API keys regularly**
3. **Use different API keys for development and production**
4. **Monitor API usage to stay within free tier limits**
5. **Implement rate limiting in your application**

## Upgrading to Paid Tiers

If you need to scale beyond free tier limits:

1. **Mistral AI:** Upgrade at https://console.mistral.ai/
2. **Hugging Face:** Pro tier for enterprise features
3. **Consider managed services:** AWS Bedrock, Google Cloud Vertex AI, Azure OpenAI

These paid services offer better performance, higher rate limits, and additional features.
