# Bazarsip

A modern, full-stack e-commerce platform built with Next.js 15, PostgreSQL, and TypeScript. Features a complete admin dashboard, customer shopping experience, and RESTful API.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Test Accounts](#test-accounts)
- [Contributing](#contributing)

## ✨ Features

### Customer Features

- 🛍️ **Product Browsing**: Browse products with search and category filters
- 🛒 **Shopping Cart**: Add/remove items with quantity management
- 📦 **Order Management**: Place orders and track order history
- 👤 **User Profile**: Manage account information
- 📱 **Responsive Design**: Fully responsive across all devices

### Admin Features

- 📊 **Dashboard**: Overview of sales, orders, and inventory
- 📦 **Product Management**: CRUD operations for products
- 📁 **Category Management**: Organize products into categories
- 🛍️ **Order Management**: Process and update order statuses
- 👥 **User Management**: Manage customer accounts and roles

### Technical Features

- 🔐 **JWT Authentication**: Secure authentication with HTTP-only cookies
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- 📱 **Server Components**: Optimized with React Server Components
- 🚀 **API Routes**: RESTful API with comprehensive documentation
- 🔍 **SEO Optimized**: Built-in SEO best practices

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken, jose)
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger UI
- **Containerization**: Docker & Docker Compose

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Docker**: Latest version ([Download](https://www.docker.com/))
- **Docker Compose**: v2.x or higher (included with Docker Desktop)
- **Git**: Latest version ([Download](https://git-scm.com/))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bazarsip.git
cd bazarsip
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) section).

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port `5433`.

### 5. Initialize the Database

```bash
# Connect to PostgreSQL
docker exec -it bazarsip-postgres psql -U postgres -d bazarsip

# Or use your preferred PostgreSQL client and run the schema file
```

Then execute the SQL schema file:

```bash
# From your terminal (if psql is installed locally)
psql -h localhost -p 5433 -U postgres -d bazarsip -f bazarsip-schema.sql

# Or copy-paste the contents of bazarsip-schema.sql into your PostgreSQL client
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/bazarsip

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Generating a Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## 🗄️ Database Setup

### Using Docker (Recommended)

The `docker-compose.yml` file is already configured. Simply run:

```bash
# Start PostgreSQL
docker-compose up -d

# Check if it's running
docker ps

# View logs
docker-compose logs -f postgres
```

### Manual PostgreSQL Setup

If you prefer to use a local PostgreSQL installation:

1. Install PostgreSQL 16+
2. Create a database named `bazarsip`
3. Update the `DATABASE_URL` in `.env.local`
4. Run the schema file: `psql -U your_user -d bazarsip -f bazarsip-schema.sql`

### Database Management

```bash
# Stop PostgreSQL container
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart PostgreSQL
docker-compose restart postgres

# Access PostgreSQL CLI
docker exec -it bazarsip-postgres psql -U postgres -d bazarsip

# Backup database
docker exec bazarsip-postgres pg_dump -U postgres bazarsip > backup.sql

# Restore database
docker exec -i bazarsip-postgres psql -U postgres bazarsip < backup.sql
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Access the application at:

- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/dashboard
- **Customer Shop**: http://localhost:3000/shop
- **API Documentation**: http://localhost:3000/api-docs

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### API Endpoints Overview

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Products

- `GET /api/products` - List products (with pagination & filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Categories

- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

#### Orders

- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin)

#### Users

- `GET /api/users` - List users (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## 📁 Project Structure

```
bazarsip/
├── app/                          # Next.js app directory
│   ├── (admin)/                  # Admin routes
│   │   ├── dashboard/            # Dashboard page
│   │   ├── products/             # Product management
│   │   ├── categories/           # Category management
│   │   ├── orders/               # Order management
│   │   ├── users/                # User management
│   │   └── layout.tsx            # Admin layout
│   ├── (auth)/                   # Auth routes
│   │   ├── login/                # Login page
│   │   ├── register/             # Register page
│   │   └── layout.tsx            # Auth layout
│   ├── (customer)/               # Customer routes
│   │   ├── shop/                 # Product catalog
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout process
│   │   ├── my-orders/            # Order history
│   │   ├── profile/              # User profile
│   │   └── layout.tsx            # Customer layout
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Product endpoints
│   │   ├── categories/           # Category endpoints
│   │   ├── orders/               # Order endpoints
│   │   └── users/                # User endpoints
│   ├── components/               # React components
│   │   ├── admin/                # Admin components
│   │   ├── customer/             # Customer components
│   │   └── ui/                   # Shared UI components
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database connection
│   ├── auth.ts                   # Authentication utilities
│   ├── swagger.ts                # API documentation
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
├── types/                        # TypeScript types
├── bazarsip-schema.sql           # Database schema
├── docker-compose.yml            # Docker configuration
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 👥 Test Accounts

The database comes pre-populated with test accounts:

### Admin Account

- **Email**: `admin@bazarsip.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard access

### Customer Account

- **Email**: `customer@bazarsip.com`
- **Password**: `customer123`
- **Access**: Customer shopping interface

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/dapraws/Bazarsip.git
cd Bazarsip
```

### 2. Create a Branch

```bash
git checkout -b DEV_your-name
```

### 4. Make Your Changes

- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

### 5. Commit Your Changes

```bash
git add .
git commit -m "Add: your feature description"
```

### 6. Push to Your Fork

```bash
git push -u origin DEV_your-name
```

### 7. Create a Pull Request

Go to the repository and click "New Pull Request".

### Coding Guidelines

- **TypeScript**: Use proper types, avoid `any` when possible
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic
- **Formatting**: Code is auto-formatted with ESLint

### Commit Message Convention

```
Type: Short description

- Add: New feature
- Fix: Bug fix
- Update: Update existing feature
- Remove: Remove code or files
- Refactor: Code refactoring
- Docs: Documentation changes
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use

If port 3000 or 5433 is already in use:

```bash
# Change Next.js port
npm run dev -- -p 3001

# Change PostgreSQL port in docker-compose.yml
# Edit the ports section: "5434:5432"
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- PostgreSQL community
- All contributors to this project

---

**Made with ❤️ by the SwatuDevHouse Team**
