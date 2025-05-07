# AquaCRM - Water Management System

A comprehensive CRM system for Water Management with customer management, consumption tracking, invoice generation and payment processing capabilities.

## Features

- **Customer Management:** Add, edit, and delete customers, assign meters, track consumption history, and upload documents
- **Water Meter Tracking:** Log manual meter readings, track consumption logs, and manage meter installations
- **Invoice Generation:** Auto-generate invoices, calculate charges with GST integration, create customizable PDF invoices
- **Billing & Payments:** Process payments, generate receipts, and send payment reminders
- **Reporting Dashboard:** View key metrics, consumption trends, and revenue insights
- **Role-based Access Control:** Administrator, meter reader, and customer user roles

## 📋 Prerequisites

- Node.js >= 18.x
- npm >= 9.x

## 🚀 Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd water-management-crm
```

## Running in Development Mode

The application consists of two parts:
1. Backend server (Express.js)
2. Frontend client (React/Vite)

### Option 1: Run Everything Together (Default)

This is the simplest way to run the application during development:

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

The application will be available at http://localhost:5000

### Option 2: Run Frontend and Backend Separately

This is useful for development with independent frontend and backend servers.

#### Configuration Setup

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend Configuration - IMPORTANT for separate frontend/backend
   VITE_API_BASE_URL=http://localhost:5000
   ```

2. Create a `.env.local` file in the project root for frontend environment variables:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

#### For Windows:

##### Terminal 1 - Backend Server

```cmd
REM Go to project root
cd water-management-crm

REM Set environment variable for Windows
set NODE_ENV=development
set PORT=5000

REM Run the backend server only
npx tsx server/index.ts
```

The backend will run on http://localhost:5000

##### Terminal 2 - Frontend Development Server

```cmd
REM Go to project root
cd water-management-crm

REM Run the frontend development server with Vite directly
npx vite
```

The frontend development server will run on http://localhost:5173 with hot module replacement.

#### For Linux/Mac:

##### Terminal 1 - Backend Server

```bash
# Go to project root
cd water-management-crm

# Run the backend server only
PORT=5000 NODE_ENV=development npx tsx server/index.ts
```

##### Terminal 2 - Frontend Development Server

```bash
# Go to project root
cd water-management-crm

# Run the frontend development server with Vite directly
npx vite
```

#### CORS Configuration Note

When running the frontend and backend on different ports, CORS (Cross-Origin Resource Sharing) is automatically enabled in development mode. The server is configured to accept requests from the frontend development server.

## Project Structure

```
water-management-crm/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and helpers
│   │   ├── pages/          # Application pages
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Application entry point
│   ├── index.html          # HTML template
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Storage interface and implementation
│   └── vite.ts             # Vite integration for Express
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema and types
└── package.json            # Project dependencies and scripts
```

## Customizing Invoices

AquaCRM provides a highly customizable invoice system:

1. Open an invoice to view
2. Click on the "Customize" tab to modify:
   - Company information
   - Invoice labels
   - Custom messages
3. Use the "Settings" tab to:
   - Toggle logo display
   - Toggle consumption chart display
   - Change primary color
4. Generate a PDF by clicking the "Download PDF" button

## Database Configuration

The application uses an in-memory database by default. To use a persistent database:

1. Install PostgreSQL
2. Update the database connection configuration in the `.env` file
3. Run migrations to create the database schema

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (for PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/aquacrm

# Email Service (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret
```

## License

[MIT](LICENSE)