# Medical Appointment System API

A RESTful API for managing medical appointments built with Node.js, Express, and MongoDB.

## Team Structure

| Member       | Modules                                     |
| ------------ | ------------------------------------------- |
| **Kero**     | Auth & Core Infrastructure + Patient Module |
| **Member 2** | Doctor + Specialty + Appointment Modules    |
| **Member 3** | Admin + User Modules                        |

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory (see `.env` example):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-appointment-system
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
SENDER_EMAIL=your_email@gmail.com
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
ENCRYPTION_KEY=your_encryption_key_32chars
FRONTEND_URL=http://localhost:3000
```

### Run

```bash
# Development
npm run dev

# Production
npm start

# Seed admin user
npm run seed
```

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint           | Description             | Auth |
| ------ | ------------------ | ----------------------- | ---- |
| POST   | `/register`        | Register new user       | No   |
| POST   | `/login`           | Login                   | No   |
| POST   | `/verify-otp`      | Verify email OTP        | No   |
| POST   | `/resend-otp`      | Resend verification OTP | No   |
| POST   | `/forgot-password` | Request password reset  | No   |
| POST   | `/reset-password`  | Reset password with OTP | No   |
| POST   | `/refresh-token`   | Refresh access token    | No   |
| POST   | `/change-password` | Change password         | Yes  |
| POST   | `/logout`          | Logout (single device)  | Yes  |
| POST   | `/logout-all`      | Logout (all devices)    | Yes  |

### Patients (`/api/patients`)

| Method | Endpoint     | Description            | Auth | Role          |
| ------ | ------------ | ---------------------- | ---- | ------------- |
| POST   | `/profile`   | Create patient profile | Yes  | Patient       |
| GET    | `/profile`   | Get my profile         | Yes  | Patient       |
| PATCH  | `/profile`   | Update medical profile | Yes  | Patient       |
| PATCH  | `/user-info` | Update basic info      | Yes  | Patient       |
| GET    | `/`          | Get all patients       | Yes  | Admin, Doctor |
| GET    | `/:id`       | Get patient by ID      | Yes  | Admin, Doctor |
| DELETE | `/:id`       | Delete patient profile | Yes  | Admin         |

## Project Architecture

```
src/
├── core/           # Shared infrastructure
│   ├── config/     # Environment & app configuration
│   ├── database/   # MongoDB connection
│   ├── middlewares/ # Auth, validation, error handling
│   ├── errors/     # Custom error classes
│   ├── utils/      # Helpers (OTP, hash, email, etc.)
│   ├── security/   # JWT & encryption
│   └── logger/     # Winston logger
├── modules/        # Feature modules
│   ├── auth/       # Authentication
│   ├── users/      # User model (shared)
│   ├── patients/   # Patient management
│   ├── doctors/    # (Team member 2)
│   ├── appointments/ # (Team member 2)
│   ├── specialties/  # (Team member 2)
│   └── admin/      # (Team member 3)
├── routes/         # Route aggregator
├── app.js          # Express setup
└── server.js       # Server bootstrap
```
