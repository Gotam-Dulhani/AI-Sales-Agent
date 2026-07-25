# AI Customer Support & Sales Agent Platform

**Tagline:** "An AI employee that handles customer support, sales, lead qualification, and order management for businesses."

## Problem Statement

Small businesses in Pakistan receive hundreds of repetitive customer messages on WhatsApp every day:

- "Price kya hai?"
- "Delivery charges?"
- "Available hai?"
- "Order ka status?"
- "Best product under 5000?"

Business owners spend hours replying manually.

## Solution

Your AI Platform Solves This:
- ✅ Answers customers automatically
- ✅ Understands business documents
- ✅ Recommends products
- ✅ Tracks orders
- ✅ Qualifies leads
- ✅ Transfers complex cases to a human
- ✅ Provides analytics to business owners

## Core Features

- **AI Customer Support** - Automated chat responses using LLM
- **Business Knowledge Base** - RAG-based document understanding
- **Product Recommendation Engine** - Smart product suggestions
- **Order Tracking** - Real-time order status updates
- **Lead Qualification** - AI-powered lead scoring
- **Customer Memory** - Long-term conversation memory
- **Multi-Agent System** - Specialized agents for different tasks
- **Analytics Dashboard** - Business insights and metrics
- **Human Handoff** - Seamless transfer to human agents
- **Docker Deployment** - Easy containerized deployment

## Architecture

The platform consists of:
- **Frontend**: Next.js with modern UI components
- **Backend**: FastAPI with async support
- **AI**: Gemini API for LLM capabilities
- **Vector DB**: Qdrant for RAG and embeddings
- **Database**: PostgreSQL for data persistence

## Multi-Agent System

The system uses a multi-agent architecture with:
- **Manager Agent** - Routes messages to appropriate specialized agents
- **Sales Agent** - Handles product recommendations and sales
- **Support Agent** - Handles customer support queries
- **Order Agent** - Handles order tracking and management

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy
- Pydantic

### AI & ML
- Mistral AI (Free tier for LLM)
- Hugging Face (Free sentence-transformers for embeddings)
- LangGraph for agent orchestration
- Qdrant Vector Database (Self-hosted, free)

### Database
- PostgreSQL
- Qdrant (Vector DB)

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd ai-sales-agent

# Copy environment file
cp .env.example .env

# Edit .env with your API keys and configuration

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
ai-sales-agent/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── agents/      # AI agents
│   │   ├── core/        # Configuration
│   │   ├── db/          # Database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # Next.js frontend
│   ├── app/            # App router pages
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── package.json
├── docker/              # Docker configurations
├── docs/               # Documentation
├── docker-compose.yml
└── .env.example
```

## Database Schema

The platform uses the following tables:
- `users` - Business owners
- `businesses` - Multi-tenant business data
- `customers` - End customers
- `chats` - Conversation records
- `messages` - Individual chat messages
- `documents` - Uploaded PDFs and FAQs
- `products` - Business products
- `orders` - Customer orders
- `order_items` - Products in orders
- `leads` - Qualified leads

## Environment Variables

See `.env.example` for required environment variables:
- Database credentials
- **Free API Keys:**
  - `MISTRAL_API_KEY` - Get free API key from [Mistral AI](https://console.mistral.ai/)
  - `HUGGINGFACE_API_KEY` - Optional, for Hugging Face models (free)
  - `GEMINI_API_KEY` - Optional, Google Gemini has free tier
- Qdrant configuration
- JWT secrets

## License

MIT License - See LICENSE file for details
