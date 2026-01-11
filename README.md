# ERP CRM System

A complete full-stack ERP CRM system with customer portal, worksheet management, invoice management, order/service management, and support ticket system.

## Features

- **Customer Portal**: Manage customer relationships, track orders and spending
- **Worksheet Management**: Organize and track worksheets with status and priority
- **Invoice Management**: Create, manage, and track invoices
- **Order & Service Management**: Track orders and services with status updates
- **Support Tickets**: Manage customer support requests with messaging and ratings
- **Dashboard**: Overview of all key metrics and recent activities
- **JWT Authentication**: Secure authentication with JWT tokens
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Frontend
- React 19
- React Router
- Axios
- Lucide React (Icons)
- Vite

### Backend
- Node.js
- Express.js
- PostgreSQL with Sequelize
- JWT Authentication
- Bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
DB_NAME=erp_crm
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Make sure PostgreSQL is running on your system and create the database:
```sql
CREATE DATABASE erp_crm;
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/DealStack_CRM
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port Vite assigns)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Worksheets
- `GET /api/worksheets` - Get all worksheets
- `GET /api/worksheets/:id` - Get single worksheet
- `POST /api/worksheets` - Create worksheet
- `PUT /api/worksheets/:id` - Update worksheet
- `DELETE /api/worksheets/:id` - Delete worksheet

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `PUT /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/messages` - Add message to ticket
- `PUT /api/tickets/:id/status` - Update ticket status
- `PUT /api/tickets/:id/rating` - Add rating to ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent` - Get recent activities

## Authentication

All routes except `/api/auth/register` and `/api/auth/login` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Default User

After starting the backend, you can register a new user through the frontend or use the API directly.

## Project Structure

```
erp-crm/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   └── DealStack_CRM/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── context/     # React context
│       │   └── utils/        # Utility functions
│       └── package.json
└── README.md
```

## Development

- Backend runs on port 5000
- Frontend runs on port 5173 (Vite default)
- PostgreSQL should be running locally or provide a cloud connection string
- The database tables will be created automatically on first run

## Production

For production deployment:
1. Set `NODE_ENV=production` in backend `.env`
2. Build the frontend: `npm run build`
3. Use a production PostgreSQL instance
4. Set secure JWT_SECRET
5. Configure CORS for your domain
6. Update database connection settings in `.env`

## License

ISC

# DealStackCRM
