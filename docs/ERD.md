# Entity Relationship Diagram (ERD)

## Database Schema Overview

The AI Sales Agent Platform uses PostgreSQL as its primary database with the following tables:

## Table Definitions

### 1. users
Stores information about business owners and administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| email | String | UNIQUE, NOT NULL, INDEXED | User email address |
| hashed_password | String | NOT NULL | Bcrypt hashed password |
| full_name | String | NULLABLE | User's full name |
| phone | String | NULLABLE | Phone number |
| is_active | Boolean | DEFAULT: true | Account status |
| is_business_owner | Boolean | DEFAULT: true | Role flag |
| created_at | DateTime | DEFAULT: NOW() | Account creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- One-to-Many with businesses (owner_id)

---

### 2. businesses
Manages multi-tenant business data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| name | String | NOT NULL | Business name |
| description | Text | NULLABLE | Business description |
| industry | String | NULLABLE | Industry category |
| website | String | NULLABLE | Website URL |
| phone | String | NULLABLE | Contact phone |
| email | String | NULLABLE | Contact email |
| address | Text | NULLABLE | Physical address |
| is_active | Boolean | DEFAULT: true | Business status |
| owner_id | Integer | FOREIGN KEY → users.id, NOT NULL | Business owner |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with users (owner_id)
- One-to-Many with customers, products, orders, documents, chats

---

### 3. customers
Stores end customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| name | String | NULLABLE | Customer name |
| phone | String | UNIQUE, INDEXED, NULLABLE | Phone number |
| email | String | NULLABLE | Email address |
| whatsapp_number | String | UNIQUE, INDEXED, NULLABLE | WhatsApp number |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| notes | Text | NULLABLE | Customer notes |
| total_orders | Integer | DEFAULT: 0 | Order count |
| total_spent | Integer | DEFAULT: 0 | Total spending amount |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)
- One-to-Many with chats, orders, leads

---

### 4. chats
Records conversation sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| customer_id | Integer | FOREIGN KEY → customers.id, NOT NULL | Associated customer |
| status | Enum | DEFAULT: 'active' | Chat status (active, closed, handed_over) |
| assigned_agent | String | NULLABLE | Agent handling the chat |
| last_message_at | DateTime | NULLABLE | Last message timestamp |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)
- Many-to-One with customers (customer_id)
- One-to-Many with messages

**Enum Values for status:**
- `active` - Ongoing conversation
- `closed` - Conversation ended
- `handed_over` - Transferred to human

---

### 5. messages
Stores individual chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| chat_id | Integer | FOREIGN KEY → chats.id, NOT NULL | Associated chat |
| role | Enum | NOT NULL | Message role (user, assistant, system) |
| content | Text | NOT NULL | Message content |
| agent_used | String | NULLABLE | AI agent that generated the message |
| metadata | Text | NULLABLE | Additional data (JSON string) |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |

**Relationships:**
- Many-to-One with chats (chat_id)

**Enum Values for role:**
- `user` - Customer message
- `assistant` - AI response
- `system` - System message

---

### 6. documents
Contains uploaded business documents and FAQs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| title | String | NOT NULL | Document title |
| description | Text | NULLABLE | Document description |
| file_path | String | NULLABLE | File storage path |
| document_type | Enum | DEFAULT: 'pdf' | Document type |
| status | Enum | DEFAULT: 'processing' | Processing status |
| chunk_count | Integer | DEFAULT: 0 | Number of text chunks |
| qdrant_collection | String | NULLABLE | Qdrant collection name |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)

**Enum Values for document_type:**
- `pdf` - PDF document
- `faq` - FAQ document
- `policy` - Policy document
- `manual` - Manual document

**Enum Values for status:**
- `processing` - Being processed
- `ready` - Ready for use
- `failed` - Processing failed

---

### 7. products
Lists business products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| name | String | NOT NULL | Product name |
| description | Text | NULLABLE | Product description |
| price | Float | NOT NULL | Current price |
| compare_price | Float | NULLABLE | Original price (for discounts) |
| sku | String | UNIQUE, INDEXED, NULLABLE | Stock keeping unit |
| category | String | NULLABLE | Product category |
| tags | Text | NULLABLE | Product tags (JSON array) |
| images | Text | NULLABLE | Product images (JSON array) |
| stock_quantity | Integer | DEFAULT: 0 | Available stock |
| status | Enum | DEFAULT: 'active' | Product status |
| weight | Float | NULLABLE | Product weight |
| dimensions | Text | NULLABLE | Product dimensions (JSON) |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)
- One-to-Many with order_items

**Enum Values for status:**
- `active` - Available for sale
- `inactive` - Not available
- `out_of_stock` - Out of stock

---

### 8. orders
Tracks customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| customer_id | Integer | FOREIGN KEY → customers.id, NOT NULL | Associated customer |
| order_number | String | UNIQUE, INDEXED, NOT NULL | Order reference number |
| status | Enum | DEFAULT: 'pending' | Order status |
| payment_status | Enum | DEFAULT: 'pending' | Payment status |
| subtotal | Float | DEFAULT: 0 | Subtotal before tax/shipping |
| tax | Float | DEFAULT: 0 | Tax amount |
| shipping_cost | Float | DEFAULT: 0 | Shipping cost |
| discount | Float | DEFAULT: 0 | Discount amount |
| total | Float | DEFAULT: 0 | Final total |
| currency | String | DEFAULT: 'PKR' | Currency code |
| notes | Text | NULLABLE | Order notes |
| shipping_address | Text | NULLABLE | Delivery address |
| tracking_number | String | NULLABLE | Shipment tracking number |
| estimated_delivery | DateTime | NULLABLE | Expected delivery date |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)
- Many-to-One with customers (customer_id)
- One-to-Many with order_items

**Enum Values for status:**
- `pending` - Awaiting confirmation
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - Shipped
- `delivered` - Delivered
- `cancelled` - Cancelled
- `refunded` - Refunded

**Enum Values for payment_status:**
- `pending` - Payment pending
- `paid` - Payment complete
- `failed` - Payment failed
- `refunded` - Payment refunded

---

### 9. order_items
Details products within each order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| order_id | Integer | FOREIGN KEY → orders.id, NOT NULL | Associated order |
| product_id | Integer | FOREIGN KEY → products.id, NOT NULL | Associated product |
| quantity | Integer | DEFAULT: 1 | Item quantity |
| unit_price | Float | NOT NULL | Price per unit |
| total_price | Float | NOT NULL | Total price (quantity × unit_price) |
| product_name | String | NULLABLE | Product name snapshot |
| product_sku | String | NULLABLE | Product SKU snapshot |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |

**Relationships:**
- Many-to-One with orders (order_id)
- Many-to-One with products (product_id)

---

### 10. leads
Stores qualified lead information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| business_id | Integer | FOREIGN KEY → businesses.id, NOT NULL | Associated business |
| customer_id | Integer | FOREIGN KEY → customers.id, NOT NULL | Associated customer |
| status | Enum | DEFAULT: 'new' | Lead status |
| source | Enum | DEFAULT: 'whatsapp' | Lead source |
| score | Float | DEFAULT: 0 | Lead qualification score (0-100) |
| interest_level | String | NULLABLE | Interest level (high, medium, low) |
| budget | String | NULLABLE | Customer budget |
| timeline | String | NULLABLE | Purchase timeline |
| notes | Text | NULLABLE | Lead notes |
| assigned_to | Integer | FOREIGN KEY → users.id, NULLABLE | Assigned staff member |
| follow_up_date | DateTime | NULLABLE | Scheduled follow-up |
| created_at | DateTime | DEFAULT: NOW() | Creation timestamp |
| updated_at | DateTime | ON UPDATE: NOW() | Last update timestamp |

**Relationships:**
- Many-to-One with businesses (business_id)
- Many-to-One with customers (customer_id)
- Many-to-One with users (assigned_to)

**Enum Values for status:**
- `new` - New lead
- `contacted` - Contacted
- `qualified` - Qualified
- `converted` - Converted to customer
- `lost` - Lost lead

**Enum Values for source:**
- `whatsapp` - WhatsApp
- `website` - Website
- `referral` - Referral
- `other` - Other source

---

## Entity Relationships

```
users (1) ────────< (N) businesses
                      │
                      ├───< (N) customers ────< (N) chats ────< (N) messages
                      │                          │
                      ├───< (N) products ────────┘
                      │                          │
                      ├───< (N) orders ────────< (N) order_items
                      │                          │
                      ├───< (N) documents
                      │
                      └───< (N) leads

customers (1) ────────< (N) leads
```

## Indexes

### Performance Indexes
- **users.email** - Unique index for login
- **customers.phone** - Unique index for customer lookup
- **customers.whatsapp_number** - Unique index for WhatsApp integration
- **products.sku** - Unique index for product lookup
- **orders.order_number** - Unique index for order tracking

### Foreign Key Indexes
All foreign key columns are automatically indexed for join performance.

## Data Integrity

### Constraints
- **NOT NULL** - Required fields
- **UNIQUE** - Unique identifiers
- **FOREIGN KEY** - Referential integrity
- **CHECK** - Enum value validation

### Cascading Rules
- **ON DELETE RESTRICT** - Prevent deletion of referenced records
- **ON UPDATE CASCADE** - Propagate ID changes (if any)

## Migration Strategy

The database schema is managed using Alembic migrations:
- Version-controlled schema changes
- Rollback capability
- Migration history tracking
