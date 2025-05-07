# AquaCRM - Water Management System

A comprehensive CRM system for Water Management with customer management, consumption tracking, invoice generation, payment processing, and complaint management capabilities.

## Features

### Core Features

- **Customer Management:** 
  - Add, edit, and delete customer profiles
  - Assign water meters to customers
  - Track consumption history and trends
  - Upload and manage customer documents (Aadhaar, address proof)
  - View customers by zone/area

- **Water Meter Tracking:** 
  - Log manual meter readings
  - Track consumption logs with date-wise entries
  - Manage meter installations and maintenance
  - Support for different meter types (analog, digital, smart)
  - Meter status tracking (active, inactive, maintenance)

- **Invoice Generation:** 
  - Auto-generate invoices based on readings
  - Calculate charges with GST integration
  - Create customizable PDF invoices
  - Add multiple charge components (water, maintenance, penalties)
  - Batch invoice generation

- **Billing & Payments:** 
  - Process payments through multiple methods (cash, online, cheque)
  - Generate receipts
  - Send payment reminders
  - Track payment history
  - Handle partial payments

- **Reporting Dashboard:** 
  - View key metrics and KPIs
  - Analyze consumption trends
  - Track revenue and outstanding payments
  - Monitor meter performance
  - Area-wise consumption analysis

- **Complaint Management System:**
  - Submit detailed complaints with priority levels
  - Categorize issues (water quality, leakage, billing, meter, service)
  - Track complaint status (open, assigned, in progress, resolved, closed)
  - Add comments and internal notes to complaints
  - Assign complaints to staff members
  - View complaint timelines and resolution history
  - Filter and search complaints

- **Role-based Access Control:** 
  - Administrator: Full system access
  - Meter Reader: Access to add readings and view customer information
  - Customer: Access to view bills, consumption, and file complaints

### Upcoming Features

- **SMS/Email Notification System:**
  - Automated bill notifications
  - Payment confirmations
  - Complaint status updates
  - Service interruption alerts
  - Consumption threshold alerts

- **Interactive Water Consumption Dashboard:**
  - Real-time consumption monitoring
  - Graphical consumption patterns
  - Comparative analysis (month-over-month, year-over-year)
  - Usage anomaly detection
  - Water saving recommendations

- **IoT Integration for Automated Meter Readings:**
  - Support for smart water meters
  - Automatic data collection
  - Real-time consumption monitoring
  - Leak detection alerts
  - Remote meter management

- **Mobile App for Field Staff and Customers:**
  - Meter reading capture with GPS tagging
  - Offline data collection capabilities
  - Customer self-service portal
  - Payment processing through mobile
  - Field service task management

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

## Seeding the Database

To populate the database with sample data for development and testing:

```bash
# Run the seed script
./seed.sh
```

This will create:
- 3 users (admin, meter reader, customer)
- 15 customers
- 20 water meters
- 120 meter readings
- 30 invoices
- Payments for paid invoices
- 20 complaints with varying statuses and priorities
- Multiple comments for each complaint

You can use this data to test the various features of the application including the Complaint Management System.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (for PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/aquacrm

# Email Service (for notifications via SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@example.com

# SMS Service (for SMS notifications via Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret

# IoT Integration (for smart meters)
IOT_API_ENDPOINT=https://your-iot-platform-api.com
IOT_API_KEY=your_iot_platform_api_key
IOT_DEVICE_SECRET=your_iot_device_secret

# Payment Gateway Integration
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_api_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret
```

### Setting Up Notifications

1. **Email Notifications**:
   - Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
   - Create an API key with appropriate permissions
   - Add your SendGrid API key to the `.env` file
   - Verify a sender email address in SendGrid

2. **SMS Notifications**:
   - Create a Twilio account at [twilio.com](https://twilio.com)
   - Obtain your Account SID and Auth Token
   - Purchase a phone number for sending SMS
   - Add Twilio credentials to the `.env` file

### Setting Up IoT Integration

1. Create an account with your preferred IoT platform
2. Register your smart water meters as devices
3. Obtain API keys/credentials
4. Add credentials to the `.env` file
5. Configure webhook endpoints or API polling as needed

## Role-Based Access Control

AquaCRM features a comprehensive role-based access control system with three primary user roles:

### Administrator Role

Administrators have complete access to all system features and functionalities including:
- Customer management (create, update, delete)
- Meter management (installation, removal, maintenance)
- Invoice generation and management
- Payment processing and reconciliation
- Complaint resolution and assignment
- User management and role assignments
- System configuration and settings
- Reports and analytics

### Meter Reader Role

Meter Readers have access to a limited set of features focused on their specific responsibilities:
- View customer information (read-only)
- Record meter readings
- View meter installation details
- Report meter issues/maintenance needs
- Access their assigned service areas
- View past readings history
- Cannot access billing, payment, or administrative functions

### Customer Role

Customers have access to their own information and services:
- View personal account details
- Access consumption history and patterns
- View bills and payment history
- Make online payments
- Submit and track complaints
- View service notifications
- Update contact information
- Cannot access other customers' data or administrative functions

## License

[MIT](LICENSE)