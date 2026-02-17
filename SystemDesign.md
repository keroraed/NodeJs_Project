# Medical Appointment System — System Design Document

---

## 1. User Roles

| Role    | Description                                      |
| ------- | ------------------------------------------------ |
| Admin   | Pre-seeded account. Manages doctors, specialties, views everything. |
| Doctor  | Registers → needs admin approval. Manages schedule & appointments. |
| Patient | Registers freely. Browses doctors and books appointments. |

---

## 2. Data Models (MongoDB + Mongoose)

### 2.1 User

Shared model for all roles (single collection, distinguished by `role` field).

| Field             | Type     | Notes                                      |
| ----------------- | -------- | ------------------------------------------ |
| `_id`             | ObjectId | Auto-generated                             |
| `name`            | String   | Required                                   |
| `email`           | String   | Required, unique                           |
| `password`        | String   | Hashed with bcrypt                         |
| `role`            | String   | Enum: `admin`, `doctor`, `patient`         |
| `phone`           | String   | Optional                                   |
| `dateOfBirth`     | Date     | Optional                                   |
| `gender`          | String   | Optional (male/female)                     |
| `address`         | String   | Optional                                   |
| `isActive`        | Boolean  | Default `true`. Admin can block a user.    |
| `isVerified`      | Boolean  | Default `false`. Set `true` after OTP verification. |
| `otp`             | String   | 6-digit code for email verification        |
| `otpExpiry`       | Date     | OTP expiration time (e.g., 10 minutes)     |
| `resetToken`      | String   | Token for password reset                   |
| `resetTokenExpiry`| Date     | Reset token expiration time                |
| `createdAt`       | Date     | Timestamps                                 |

---

### 2.2 Doctor Profile

Extends user info. One-to-one with a User whose role is `doctor`.

| Field            | Type       | Notes                                              |
| ---------------- | ---------- | -------------------------------------------------- |
| `_id`            | ObjectId   |                                                    |
| `user`           | ObjectId   | Ref → User                                         |
| `specialty`      | ObjectId   | Ref → Specialty                                    |
| `bio`            | String     | Short description                                  |
| `isApproved`     | Boolean    | Default `false`. Admin approves.                   |
| `availability`   | Array      | See Availability sub-schema below                  |

**Availability sub-schema (embedded)**

| Field   | Type   | Notes                                         |
| ------- | ------ | --------------------------------------------- |
| `day`   | String | Enum: `Sunday`…`Saturday`                     |
| `slots` | Array  | List of `{ startTime: String, endTime: String }` e.g. `"09:00"`, `"09:30"` |

---

### 2.3 Patient Profile

| Field           | Type     | Notes                                            |
| --------------- | -------- | ------------------------------------------------ |
| `_id`           | ObjectId |                                                  |
| `user`          | ObjectId | Ref → User                                       |
| `medicalHistory`| String   | Optional. Patient can add notes, allergies, etc. |

---

### 2.4 Appointment

| Field       | Type     | Notes                                                   |
| ----------- | -------- | ------------------------------------------------------- |
| `_id`       | ObjectId |                                                         |
| `doctor`    | ObjectId | Ref → Doctor Profile                                    |
| `patient`   | ObjectId | Ref → Patient Profile                                   |
| `date`      | Date     | Appointment date                                        |
| `startTime` | String   | e.g. `"10:00"`                                          |
| `endTime`   | String   | e.g. `"10:30"`                                          |
| `status`    | String   | Enum: `pending`, `confirmed`, `completed`, `cancelled`  |
| `notes`     | String   | Doctor can add notes                                    |
| `createdAt` | Date     | Timestamps                                              |

---

### 2.5 Specialty

| Field  | Type     | Notes          |
| ------ | -------- | -------------- |
| `_id`  | ObjectId |                |
| `name` | String   | Required, unique (e.g. Cardiology, Dermatology) |

---

## 3. API Endpoints Overview

### Auth
| Method | Route                      | Access  | Description                              |
| ------ | -------------------------- | ------- | ---------------------------------------- |
| POST   | `/api/auth/register`       | Public  | Register (patient/doctor), sends OTP     |
| POST   | `/api/auth/verify-email`   | Public  | Verify email with OTP `{ email, otp }`   |
| POST   | `/api/auth/login`          | Public  | Login (must be verified), returns JWT    |
| POST   | `/api/auth/forgot-password`| Public  | Send OTP to email `{ email }`            |
| POST   | `/api/auth/verify-otp`     | Public  | Verify OTP, returns reset token          |
| POST   | `/api/auth/reset-password` | Public  | Reset password `{ resetToken, newPassword, confirmPassword }` |

### Admin
| Method | Route                          | Access | Description                  |
| ------ | ------------------------------ | ------ | ---------------------------- |
| GET    | `/api/admin/users`             | Admin  | List all users               |
| PATCH  | `/api/admin/doctors/:id/approve` | Admin | Approve a doctor            |
| PATCH  | `/api/admin/users/:id/block`   | Admin  | Block/unblock user           |
| GET    | `/api/admin/appointments`      | Admin  | View all appointments        |
| POST   | `/api/admin/specialties`       | Admin  | Create specialty             |
| GET    | `/api/admin/specialties`       | Admin  | List specialties             |
| PUT    | `/api/admin/specialties/:id`   | Admin  | Update specialty             |
| DELETE | `/api/admin/specialties/:id`   | Admin  | Delete specialty             |

### Doctor
| Method | Route                           | Access  | Description                   |
| ------ | ------------------------------- | ------- | ----------------------------- |
| GET    | `/api/doctors/profile`          | Doctor  | Get own profile               |
| PUT    | `/api/doctors/profile`          | Doctor  | Update profile / availability |
| GET    | `/api/doctors/appointments`     | Doctor  | List own appointments         |
| PATCH  | `/api/doctors/appointments/:id` | Doctor  | Confirm/reject + add notes    |
| GET    | `/api/doctors/:id/availability`    | Patient | Get doctor's available slots      |

### Patient
| Method | Route                             | Access  | Description                  |
| ------ | --------------------------------- | ------- | ---------------------------- |
| GET    | `/api/patients/profile`           | Patient | Get own profile              |
| PUT    | `/api/patients/profile`           | Patient | Update profile               |
| GET    | `/api/patients/appointments`      | Patient | List own appointments        |
| PATCH  | `/api/patients/appointments/:id`  | Patient | Cancel or reschedule         |
| POST   | `/api/appointments`                | Patient | Book an appointment               |

### Public / Shared
| Method | Route                              | Access  | Description                       |
| ------ | ---------------------------------- | ------- | --------------------------------- |
| GET    | `/api/doctors`                     | Public  | List approved doctors (admin sees all) |
| GET    | `/api/doctors/:id`                 | Public  | Get single doctor profile         |
| GET    | `/api/specialties`                 | Public  | List all specialties              |

---

## 4. Authentication & Authorization Flow

### 4.1 Registration + Email Verification (Patient)
1. Patient registers → password hashed with **bcrypt** → saved to DB with `isVerified: false`.
2. Server generates 6-digit OTP → stores `otp` + `otpExpiry` (10 min) → sends OTP email.
3. Patient calls `/verify-email` with `{ email, otp }`.
4. Server validates OTP → sets `isVerified: true` → clears OTP fields.
5. Patient can now log in.

### 4.2 Login
1. User submits `{ email, password }`.
2. Server checks: `isVerified === true` and `isActive === true`.
3. If valid → returns **JWT** containing `{ userId, role }`.

### 4.3 Forgot Password (All Roles)
1. User calls `/forgot-password` with `{ email }`.
2. Server generates OTP → stores `otp` + `otpExpiry` → sends OTP email.
3. User calls `/verify-otp` with `{ email, otp }`.
4. Server validates → generates `resetToken` + `resetTokenExpiry` (15 min) → returns token.
5. User calls `/reset-password` with `{ resetToken, newPassword, confirmPassword }`.
6. Server validates token + passwords match → hashes new password → clears reset fields.

### 4.4 Protected Routes
1. Every protected request sends the token in `Authorization: Bearer <token>`.
2. **Auth middleware** verifies the token.
3. **Role middleware** checks `role` against allowed roles for that route.

---

## 5. Booking Logic (Keep It Simple)

1. Patient picks a doctor → frontend fetches that doctor's `availability`.
2. Patient picks a `date` + `slot` (startTime/endTime).
3. Backend checks: is there already an appointment for that doctor on that date+slot with status ≠ `cancelled`?
   - **Yes** → reject (double-booking).
   - **No** → create appointment with status `pending`.
4. (Optional) Doctor confirms → status becomes `confirmed`.
5. Email sent to patient via **nodemailer** on successful booking.

---

## 6. Notification

- Use **nodemailer** with Gmail (configured via `.env` variables: `EMAIL_USER`, `EMAIL_PASS`).
- **Emails sent on:**
  - Registration → OTP for email verification
  - Forgot password → OTP for password reset
  - Appointment booked → confirmation email to patient

---
EMAIL_USER=keroraed123@gmail.com
EMAIL_PASS=cubg aqgy ukem rmac


## 7. Frontend Pages (React)

| Page               | Route                | Role    |
| ------------------ | -------------------- | ------- |
| Login              | `/login`             | Public  |
| Register           | `/register`          | Public  |
| Admin Dashboard    | `/admin`             | Admin   |
| Manage Doctors     | `/admin/doctors`     | Admin   |
| Manage Specialties | `/admin/specialties` | Admin   |
| All Appointments   | `/admin/appointments`| Admin   |
| Doctor Dashboard   | `/doctor`            | Doctor  |
| Doctor Schedule    | `/doctor/schedule`   | Doctor  |
| Doctor Appointments| `/doctor/appointments`| Doctor |
| Browse Doctors     | `/doctors`           | Patient / Public |
| Book Appointment   | `/doctors/:id/book`  | Patient |
| My Appointments    | `/appointments`      | Patient |
| Profile            | `/profile`           | Doctor / Patient |

---

## 8. Project Folder Structure

```
/server
  /config         → db.js, dotenv setup
  /middleware      → auth.js, roleAuth.js, errorHandler.js
  /models          → User.js, DoctorProfile.js, PatientProfile.js, Appointment.js, Specialty.js
  /routes          → auth.js, admin.js, doctor.js, patient.js, appointment.js
  /controllers     → authController.js, adminController.js, doctorController.js, patientController.js, appointmentController.js
  /utils           → sendEmail.js, validators.js
  server.js

/client
  /src
    /components    → Navbar, ProtectedRoute, etc.
    /pages         → Login, Register, AdminDashboard, DoctorDashboard, etc.
    /context or /store → AuthContext or Redux store
    /services      → api.js (axios instance + interceptors)
    App.jsx
    main.jsx
```

---

## 9. Key Packages

**Backend:** express, mongoose, jsonwebtoken, bcrypt, nodemailer, dotenv, cors, express-validator (or joi)

**Frontend:** react, react-router-dom, axios, @mui/material, @reduxjs/toolkit (or Context API)

---

## 10. Admin Seeding

Create a simple seed script (`seed.js`) that inserts one admin user into the DB so you don't need an admin registration flow.

```js
const admin = { name: "Admin", email: "admin@clinic.com", password: hashedPassword, role: "admin" };
```

---
