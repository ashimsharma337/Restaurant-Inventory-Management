# Restaurant Inventory Management

A comprehensive full-stack MERN application designed to help restaurants efficiently manage their inventory, track products, categorize items, and monitor orders.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation & Setup](#️-installation--setup)
- [Database Setup](#️-database-setup)
- [Running the Application](#-running-the-application)
- [Available Scripts](#-available-scripts)
- [Project Structure](#project-structure)
- [Current Release](#current-release)
- [Contributing](#contributing)
- [License](#license)
- [Support](#️-support)

## Overview

This project is a **Restaurant Inventory Management System** built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a complete solution for restaurant owners and staff to manage their inventory operations efficiently.

### What It Manages

- **Products** - Add, edit, and track inventory items
- **Categories** - Organize products into logical categories
- **Users** - Manage staff access and permissions
- **Orders** - Track purchase and usage orders
- **Vendors** & **Pricing data** - Manage supplier relationships
- **Inventory levels** - Monitor stock quantities and alerts

> **Note:** This repository contains the initial stable backend + frontend (v1) for local development.

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management
- **Nodemon** - Development utility (dev dependency)

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Features

### Core Functionality
- Full CRUD operations for Users, Products, Categories, and Orders
- User authentication and authorization
- Real-time inventory tracking
- Vendor management
- Pricing and cost tracking
- Responsive web interface

### Security Features
- Protected routes and middleware
- Role-based access control
- Secure authentication system

## Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Restaurant-Inventory-Management.git
cd Restaurant-Inventory-Management
```

### 2️⃣ Install Backend Dependencies
```bash
cd server
npm install
```

### 3️⃣ Install Frontend Dependencies
```bash
cd ../client
npm install
```

## 🗄️ Database Setup

### MongoDB Connection

Create a `.env` file inside the server folder:

```bash
cd server
touch .env
```

Add the following environment variables to the `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/restaurant_inventory
```

### Seed the Database (Optional)

You can populate sample Users, Products, and Categories using the seed script.

#### Run using Bash (macOS & Linux)

Inside the server folder:

```bash
./scripts/seed.sh
```

Make sure the script is executable:

```bash
chmod +755 ./scripts/seed.sh
```

This will run `seed.js` inside the data folder and populate MongoDB with sample data.

## Running the Application

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9000

## Available Scripts

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend with nodemon (development mode) |
| `npm start` | Start backend normally (production mode) |
| `npm run seed` | Seed database (if configured manually) |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Create production build |
| `npm test` | Run test suite |

## Project Structure

```
Restaurant-Inventory-Management/
├── 📂 server/                 # Backend application
│   ├── 📂 auth-routes/        # Authentication routes
│   ├── 📂 controller/         # Business logic controllers
│   ├── 📂 middleware/         # Custom middleware
│   ├── 📂 models/            # MongoDB models
│   ├── 📂 routeController/   # Route handlers
│   ├── 📂 scripts/           # Utility scripts
│   ├── 📂 data/              # Database seeding scripts
│   └── 📂 uploads/           # File upload storage
│
├── 📂 client/                # Frontend React application
│   ├── 📂 public/           # Static files
│   ├── 📂 src/              # Source code
│   │   ├── 📂 components/   # React components
│   │   ├── 📂 redux/        # State management
│   │   ├── 📂 services/     # API services
│   │   └── 📂 assets/       # Images and resources
│   └── 📂 build/            # Production build
│
└── 📄 README.md             # Project documentation
```

## Current Release – v1.0.0

### What's Included

This version features:

- **Fully functional backend** with RESTful API endpoints
- **Complete CRUD operations** for Users, Products, Categories, and Orders
- **Initial React frontend** with basic UI components
- **Working APIs** with proper error handling
- **Basic authentication** system
- **Responsive design** foundation

### Known Limitations

- Basic UI styling (can be enhanced with CSS frameworks)
- Limited error handling and validation
- No advanced reporting features yet

## Contributing

Contributions are welcome and encouraged! Here's how you can help:

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Fix any linting errors

### Reporting Issues

Please open issues for:
- Bug reports
- Feature requests
- Documentation improvements

## License

This project currently does not have a license and is intended for **personal learning use**.

> **Note**: If you plan to use this project commercially, please add an appropriate license file.

## ⭐ Support

If you find this project helpful, please consider:

- **Starring** the repository to show your support
- **Reporting issues** you encounter
- **Suggesting improvements** or new features
- **Contributing** to the codebase

---

<div align="center">

**Made with ❤️ for the restaurant community**

[Star this repo](https://github.com/ashimsharma337/Restaurant-Inventory-Management) if you find it useful!

</div>
