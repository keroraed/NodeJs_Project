# Medical Appointment System API

A RESTful API for managing medical appointments between patients and doctors, built with Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Seeding Data](#seeding-data)
  - [Running the Server](#running-the-server)
- [Authentication](#authentication)
- [Scripts](#scripts)

---

## Features

- User registration with email OTP verification
- Role-based access control (Admin, Doctor, Patient)
- Doctor profile management with availability scheduling
- Patient profile management
- Appointment booking with real-time slot availability
- Password reset via OTP
- Admin panel for user management, doctor approval, and specialty management
- Rate limiting and request logging
- File upload for doctor profile pictures
- Secure JWT authentication
- Global error handling

---

## Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Runtime      | Node.js (ES Modules)          |
| Framework    | Express.js                    |
| Database     | MongoDB + Mongoose            |
| Auth         | JSON Web Tokens (JWT)         |
| Validation   | Joi                           |
| Password     | bcryptjs                      |
| Email        | Nodemailer                    |
| File Upload  | Multer                        |
| Logging      | Winston + Morgan              |
| Security     | Helmet, express-rate-limit   |
| Encryption   | crypto-js                     |

---

## Project Structure

```
src/
├── app.js                  # Express app setup
├── server.js               # Server entry point
├── routes/
│   └── index.js            # Root router
├── core/
│   ├── config/             # App config, env vars, constants
│   ├── database/           # MongoDB connection
│   ├── errors/             # ApiError class and error codes
│   ├── logger/             # Winston logger
│   ├── middlewares/        # Auth, role, validation, upload, rate-limit, error
│   ├── security/           # JWT strategy, encryption
│   └── utils/              # Date, OTP, hashing, pagination, email, token
└── modules/
    ├── auth/               # Registration, login, OTP, password reset
    ├── users/              # User model
    ├── patients/           # Patient profile and appointments
    ├── doctors/            # Doctor profile, availability, appointments
    ├── appointments/       # Appointment booking and slot management
    ├── specialties/        # Public specialty listing
    └── admin/              # Admin management panel
seed/
├── seedAdmin.js            # Seed default admin user
├── seedSpecialties.js      # Seed medical specialties
├── seedDoctors.js          # Seed sample doctors
└── seedDoctorPictures.js   # Assign pictures to seeded doctors
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- SMTP server credentials (e.g., Gmail)

### Installation

```bash
git clone <repository-url>
cd NodeJs_Project
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/medical-appointment-system

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email (SMTP)
SENDER_EMAIL=your_email@gmail.com
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000
```

### Seeding Data

```bash
# Seed the admin account
npm run seed

# Seed medical specialties
npm run seed:specialties

# Seed sample doctors
npm run seed:doctors

# Assign profile pictures to doctors
npm run seed:doctors:pictures
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`.

---

## Authentication

All protected routes require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from the `POST /api/auth/login` endpoint and expire based on `JWT_EXPIRES_IN`.

---

## Roles

| Role    | Description                                     |
|---------|-------------------------------------------------|
| admin   | Full access — manage users, doctors, specialties|
| doctor  | Manage own profile, availability, appointments  |
| patient | Book appointments, manage own profile           |

---

## Scripts

| Command                   | Description                          |
|---------------------------|--------------------------------------|
| `npm start`               | Start production server              |
| `npm run dev`             | Start development server (nodemon)   |
| `npm run seed`            | Seed admin user                      |
| `npm run seed:specialties`| Seed medical specialties             |
| `npm run seed:doctors`    | Seed sample doctor accounts          |
| `npm run seed:doctors:pictures` | Assign pictures to seeded doctors |
