# AI Sales Agent - Architecture Documentation

## System Overview

The AI Sales Agent Platform is a full-stack application designed to automate customer support, sales, lead qualification, and order management for small businesses in Pakistan.

## High-Level Architecture

```
┌─────────────────┐
│   Customer      │
│  (WhatsApp/Web) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js        │
│  Frontend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI        │
│  Backend        │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    ▼         ▼         ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐   ┌──────┐
│Gemini│ │Qdrant│ │PostgreSQL│ │Redis │
│ API  │ │Vector│ │ Database │ │Cache │
└──────┘ └──────┘ └──────┘   └──────┘
```

## Components

### Frontend (Next.js)

**Technology Stack:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Zustand (State Management)
- Axios (HTTP Client)

**Key Pages:**
- `/` - Landing page
- `/login` - User authentication
- `/register` - User registration
- `/dashboard` - Main dashboard with sidebar navigation

**Features:**
- Responsive design
- Real-time chat interface
- Analytics dashboard
- Product management
- Order tracking
- Document upload

### Backend (FastAPI)

**Technology Stack:**
- FastAPI
- Python 3.11+
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- Pydantic (Validation)

**Module Structure:**
```
app/
├── api/           # API endpoints
│   ├── auth.py    # Authentication
│   ├── business.py # Business management
│   ├── chat.py    # Chat & messaging
│   ├── products.py # Product management
│   ├── orders.py  # Order management
│   └── documents.py # Document processing
├── agents/        # AI Agents
│   ├── manager_agent.py
│   ├── sales_agent.py
│   ├── support_agent.py
│   └── order_agent.py
├── services/      # Business logic
│   ├── ai_service.py
│   ├── rag_service.py
│   ├── embedding_service.py
│   ├── qdrant_service.py
│   └── document_service.py
├── models/        # Database models
├── schemas/       # Pydantic schemas
├── core/          # Configuration & security
└── db/            # Database session
```

## Multi-Agent System

The platform uses a multi-agent architecture to handle different types of customer interactions:

### Manager Agent
- **Responsibility:** Route incoming messages to appropriate specialized agents
- **Decision Logic:** Intent classification (sales, support, order, lead)
- **Human Handoff:** Detects when human intervention is needed

### Sales Agent
- **Responsibility:** Product inquiries and recommendations
- **Capabilities:**
  - Product search and filtering
  - Price-based recommendations
  - Cross-selling and up-selling
  - Lead qualification

### Support Agent
- **Responsibility:** Customer service and FAQ handling
- **Capabilities:**
  - RAG-based knowledge base search
  - FAQ answering
  - General customer support
  - Policy information

### Order Agent
- **Responsibility:** Order tracking and management
- **Capabilities:**
  - Order status lookup
  - Delivery information
  - Order modifications
  - Tracking number queries

## AI Services

### RAG (Retrieval-Augmented Generation)
- **Purpose:** Enhance AI responses with business-specific knowledge
- **Flow:**
  1. User query → Embedding generation
  2. Vector search in Qdrant
  3. Context retrieval
  4. LLM response generation with context

### Embedding Service
- **Provider:** OpenAI Embeddings (configurable)
- **Vector Dimension:** 768
- **Usage:** Document indexing and query similarity

### Qdrant Vector Database
- **Purpose:** Store and search document embeddings
- **Collection Strategy:** One collection per business
- **Distance Metric:** Cosine similarity

## Database Schema

### Core Tables
- **users** - Business owners and administrators
- **businesses** - Multi-tenant business data
- **customers** - End customer information
- **chats** - Conversation sessions
- **messages** - Individual chat messages
- **documents** - Uploaded business documents
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **leads** - Qualified leads

### Relationships
- Users → Businesses (1:N)
- Businesses → Customers, Products, Orders, Documents (1:N)
- Customers → Chats, Orders, Leads (1:N)
- Chats → Messages (1:N)
- Orders → Order Items (1:N)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Business
- `POST /api/business/` - Create business
- `GET /api/business/` - List businesses
- `GET /api/business/{id}` - Get business details
- `PUT /api/business/{id}` - Update business

### Chat
- `POST /api/chats` - Create chat
- `GET /api/chats` - List chats
- `POST /api/chats/{id}/messages` - Send message
- `GET /api/chats/{id}/messages` - Get messages

### Products
- `POST /api/products/` - Create product
- `GET /api/products/` - List products
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `POST /api/orders/` - Create order
- `GET /api/orders/` - List orders
- `GET /api/orders/{id}` - Get order
- `PUT /api/orders/{id}` - Update order
- `GET /api/orders/customer/{id}` - Get customer orders

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document

## Security

### Authentication
- JWT-based authentication
- Token expiration: 30 minutes (configurable)
- Password hashing with bcrypt

### Authorization
- Role-based access control
- Business data isolation (multi-tenant)
- API endpoint protection

### CORS
- Configurable allowed origins
- Credential support
- Preflight request handling

## Deployment

### Docker Compose
All services are containerized and orchestrated with Docker Compose:
- PostgreSQL (Database)
- Qdrant (Vector DB)
- Redis (Cache)
- FastAPI (Backend)
- Next.js (Frontend)
- Nginx (Reverse Proxy)

### Environment Variables
See `.env.example` for required configuration:
- Database credentials
- API keys (Gemini, OpenAI)
- JWT secrets
- CORS settings

## Performance Considerations

### Caching
- Redis for session management
- Response caching for frequent queries
- Document embedding caching

### Database Optimization
- Indexed fields for fast lookups
- Connection pooling
- Query optimization

### Scalability
- Horizontal scaling of API servers
- Load balancing with Nginx
- Vector database scaling

## Monitoring

### Health Checks
- `/health` endpoint for backend
- Database connection checks
- Service availability monitoring

### Logging
- Structured logging
- Error tracking
- Performance metrics

## Future Enhancements

1. **WhatsApp Integration** - Direct WhatsApp Business API integration
2. **Advanced Analytics** - More detailed business insights
3. **Multi-language Support** - Support for Urdu and other languages
4. **Voice Support** - Voice message handling
5. **Payment Integration** - Integration with local payment gateways
6. **Mobile App** - Native mobile applications
