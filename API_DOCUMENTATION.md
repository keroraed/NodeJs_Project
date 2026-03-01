# API Documentation — Medical Appointment System

Base URL: `http://localhost:5000/api`

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }
}
```

Authentication uses JWT Bearer tokens:

```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Auth](#2-auth)
   - [Register](#21-register)
   - [Verify Email](#22-verify-email)
   - [Resend OTP](#23-resend-otp)
   - [Login](#24-login)
   - [Forgot Password](#25-forgot-password)
   - [Verify OTP](#26-verify-otp)
   - [Reset Password](#27-reset-password)
3. [Patients](#3-patients)
   - [Get Profile](#31-get-profile)
   - [Update Profile](#32-update-profile)
   - [Get Appointments](#33-get-appointments)
   - [Update Appointment](#34-update-appointment)
4. [Doctors](#4-doctors)
   - [List Doctors](#41-list-doctors)
   - [Get Doctor by ID](#42-get-doctor-by-id)
   - [Get Doctor Availability](#43-get-doctor-availability)
   - [Get Own Profile](#44-get-own-profile)
   - [Update Own Profile](#45-update-own-profile)
   - [Upload Profile Picture](#46-upload-profile-picture)
   - [Get Own Appointments](#47-get-own-appointments)
   - [Update Own Appointment](#48-update-own-appointment)
5. [Appointments](#5-appointments)
   - [Get Available Slots](#51-get-available-slots)
   - [Book Appointment](#52-book-appointment)
6. [Specialties](#6-specialties)
   - [List Specialties](#61-list-specialties)
7. [Admin](#7-admin)
   - [List Users](#71-list-users)
   - [Approve Doctor](#72-approve-doctor)
   - [Block / Unblock User](#73-block--unblock-user)
   - [Get All Appointments](#74-get-all-appointments)
   - [Create Specialty](#75-create-specialty)
   - [List Specialties (Admin)](#76-list-specialties-admin)
   - [Update Specialty](#77-update-specialty)
   - [Delete Specialty](#78-delete-specialty)
8. [Chat (REST + WebSocket)](#8-chat-rest--websocket)
   - [Start Conversation](#81-start-conversation)
   - [List Conversations](#82-list-conversations)
   - [Send Message](#83-send-message)
   - [Get Messages](#84-get-messages)
   - [Mark as Read](#85-mark-as-read)
   - [Get Unread Count](#86-get-unread-count)
   - [WebSocket Events](#87-websocket-events)

---

## 1. Health Check

### `GET /api/health`

Verify that the API is running.

**Auth:** None

**Response `200`**

```json
{
  "success": true,
  "message": "Medical Appointment System API is running",
  "timestamp": "2026-02-27T10:00:00.000Z"
}
```

---

## 2. Auth

All auth endpoints are rate-limited to **10 requests per 15 minutes** per IP.

### 2.1 Register

**`POST /api/auth/register`**

Create a new patient or doctor account. An OTP is sent to the provided email for verification.

**Auth:** None

**Request Body**

| Field       | Type   | Required | Notes                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------|
| name        | string | Yes      | 2–50 characters                                                       |
| email       | string | Yes      | Valid email address                                                   |
| password    | string | Yes      | Min 6 chars, must contain uppercase, lowercase, digit, special char   |
| role        | string | No       | `"patient"` (default) or `"doctor"`                                   |
| phone       | string | No       | Egyptian format: `01[0125]XXXXXXXX`                                   |
| gender      | string | No       | `"male"` or `"female"`                                                |
| dateOfBirth | date   | No       | Cannot be in the future                                               |
| address     | string | No       | Max 200 characters                                                    |

**Example**

```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "Pass@123",
  "role": "patient",
  "phone": "01012345678"
}
```

**Response `201`**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "64abc...",
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "patient"
  }
}
```

---

### 2.2 Verify Email

**`POST /api/auth/verify-email`**

Verify account with the 6-digit OTP sent by email.

**Auth:** None

**Request Body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | Yes      |
| otp   | string | Yes — 6 digits |

**Example**

```json
{
  "email": "ahmed@example.com",
  "otp": "482910"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 2.3 Resend OTP

**`POST /api/auth/resend-otp`**

Resend a verification OTP to an unverified account.

**Auth:** None

**Request Body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | Yes      |

**Response `200`**

```json
{
  "success": true,
  "message": "A new OTP has been sent to your email."
}
```

---

### 2.4 Login

**`POST /api/auth/login`**

Authenticate and receive a JWT token.

**Auth:** None

**Request Body**

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | Yes      |
| password | string | Yes      |

**Example**

```json
{
  "email": "ahmed@example.com",
  "password": "Pass@123"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "64abc...",
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "patient"
  },
  "token": "eyJhbGci..."
}
```

---

### 2.5 Forgot Password

**`POST /api/auth/forgot-password`**

Request a password reset OTP. For security, the response is identical whether or not the email is registered.

**Auth:** None

**Request Body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | Yes      |

**Response `200`**

```json
{
  "success": true,
  "message": "If the email is registered, you will receive a password reset OTP."
}
```

---

### 2.6 Verify OTP

**`POST /api/auth/verify-otp`**

Verify the password-reset OTP and receive a short-lived reset token.

**Auth:** None

**Request Body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | Yes      |
| otp   | string | Yes — 6 digits |

**Response `200`**

```json
{
  "success": true,
  "message": "OTP verified. Use the reset token to set a new password.",
  "resetToken": "abc123..."
}
```

---

### 2.7 Reset Password

**`POST /api/auth/reset-password`**

Set a new password using the reset token from the previous step.

**Auth:** None

**Request Body**

| Field        | Type   | Required |
|--------------|--------|----------|
| resetToken   | string | Yes      |
| newPassword  | string | Yes — same rules as registration password |

**Response `200`**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 3. Patients

All patient endpoints require:  
`Authorization: Bearer <token>` with role `patient`

### 3.1 Get Profile

**`GET /api/patients/profile`**

Retrieve the authenticated patient's profile.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "user": { "name": "Ahmed Ali", "email": "ahmed@example.com", ... },
    "createdAt": "..."
  }
}
```

---

### 3.2 Update Profile

**`PUT /api/patients/profile`**

Update the authenticated patient's personal information.

**Request Body** (all fields optional)

| Field       | Type   |
|-------------|--------|
| name        | string |
| phone       | string |
| gender      | string |
| dateOfBirth | date   |
| address     | string |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### 3.3 Get Appointments

**`GET /api/patients/appointments`**

List the patient's appointments with optional pagination.

**Query Parameters**

| Param  | Type   | Default |
|--------|--------|---------|
| page   | number | 1       |
| limit  | number | 10      |

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 3.4 Update Appointment

**`PATCH /api/patients/appointments/:id`**

Cancel or reschedule an appointment.

**Path Parameter:** `id` — appointment ObjectId

**Request Body**

| Field  | Type   | Notes                                         |
|--------|--------|-----------------------------------------------|
| status | string | `"cancelled"` to cancel                       |
| date   | date   | New date (reschedule, must be in the future)   |
| startTime | string | New start time `HH:MM` (reschedule)        |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

## 4. Doctors

### 4.1 List Doctors

**`GET /api/doctors`**

Public endpoint — lists all approved doctors. Admin users see all doctors (including unapproved).

**Auth:** Optional

**Query Parameters**

| Param     | Type   | Notes                      |
|-----------|--------|----------------------------|
| specialty | string | Filter by specialty ObjectId|
| page      | number | Default 1                  |
| limit     | number | Default 10                 |

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 4.2 Get Doctor by ID

**`GET /api/doctors/:id`**

Retrieve a single doctor's full profile.

**Auth:** None

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": { "name": "Dr. Sara", ... },
    "specialty": { "name": "Cardiology" },
    "bio": "...",
    "availability": [ ... ],
    "isApproved": true
  }
}
```

---

### 4.3 Get Doctor Availability

**`GET /api/doctors/:id/availability`**

Retrieve a doctor's weekly availability schedule.

**Auth:** None

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:00", "endTime": "09:30" }
      ]
    }
  ]
}
```

---

### 4.4 Get Own Profile

**`GET /api/doctors/profile`**

Retrieve the authenticated doctor's own profile.

**Auth:** Bearer token — role `doctor`

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### 4.5 Update Own Profile

**`PUT /api/doctors/profile`**

Update the authenticated doctor's profile information.

**Auth:** Bearer token — role `doctor`

**Request Body** (all fields optional)

| Field        | Type    | Notes                                             |
|--------------|---------|---------------------------------------------------|
| name         | string  | 2–50 characters                                   |
| phone        | string  | Egyptian format                                   |
| bio          | string  | Max 1000 characters                               |
| specialty    | string  | Specialty ObjectId                                |
| slotDuration | number  | Minutes per slot: 15–120 (default 30)             |
| availability | array   | Array of `{ day, slots: [{ startTime, endTime }] }`|

**Example**

```json
{
  "bio": "Experienced cardiologist with 10 years of practice.",
  "specialty": "64def...",
  "slotDuration": 30,
  "availability": [
    {
      "day": "Monday",
      "slots": [
        { "startTime": "09:00", "endTime": "13:00" }
      ]
    }
  ]
}
```

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### 4.6 Upload Profile Picture

**`PATCH /api/doctors/profile/picture`**

Upload or replace the doctor's profile picture.

**Auth:** Bearer token — role `doctor`

**Content-Type:** `multipart/form-data`

| Field          | Type | Notes                          |
|----------------|------|--------------------------------|
| profilePicture | file | JPEG, PNG, or WebP — max 2 MB  |

**Response `200`**

```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "/uploads/profiles/1234567890-123456789.jpg"
  }
}
```

---

### 4.7 Get Own Appointments

**`GET /api/doctors/appointments`**

List all appointments for the authenticated doctor.

**Auth:** Bearer token — role `doctor`

**Query Parameters**

| Param  | Type   | Default |
|--------|--------|---------|
| status | string | All statuses |
| page   | number | 1       |
| limit  | number | 10      |

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 4.8 Update Own Appointment

**`PATCH /api/doctors/appointments/:id`**

Update the status of an appointment (confirm, complete, or cancel).

**Auth:** Bearer token — role `doctor`

**Path Parameter:** `id` — appointment ObjectId

**Request Body**

| Field  | Type   | Notes                                                    |
|--------|--------|----------------------------------------------------------|
| status | string | `"confirmed"`, `"completed"`, or `"cancelled"`           |

**Status Transitions**

| From      | Allowed Transitions             |
|-----------|---------------------------------|
| pending   | confirmed, cancelled            |
| confirmed | completed, cancelled            |
| cancelled | (none)                          |
| completed | (none)                          |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

## 5. Appointments

### 5.1 Get Available Slots

**`GET /api/appointments/slots`**

Retrieve available (unbooked) time slots for a specific doctor on a given date.

**Auth:** Bearer token (any role)

**Query Parameters**

| Param    | Type   | Required | Notes               |
|----------|--------|----------|---------------------|
| doctorId | string | Yes      | Doctor profile ObjectId |
| date     | string | Yes      | Format: `YYYY-MM-DD` |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "date": "2026-03-01",
    "day": "Sunday",
    "availableSlots": [
      { "startTime": "09:00", "endTime": "09:30" },
      { "startTime": "09:30", "endTime": "10:00" }
    ]
  }
}
```

---

### 5.2 Book Appointment

**`POST /api/appointments`**

Book an appointment with a doctor.

**Auth:** Bearer token — role `patient`

**Request Body**

| Field     | Type   | Required | Notes                        |
|-----------|--------|----------|------------------------------|
| doctorId  | string | Yes      | Doctor profile ObjectId      |
| date      | string | Yes      | Format: `YYYY-MM-DD`         |
| startTime | string | Yes      | Format: `HH:MM`              |
| notes     | string | No       | Optional patient notes       |

**Example**

```json
{
  "doctorId": "64abc...",
  "date": "2026-03-01",
  "startTime": "09:00",
  "notes": "Follow-up visit"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "doctor": "...",
    "patient": "...",
    "date": "2026-03-01T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "pending",
    "notes": "Follow-up visit"
  }
}
```

---

## 6. Specialties

### 6.1 List Specialties

**`GET /api/specialties`**

Retrieve all available medical specialties.

**Auth:** None

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "_id": "64abc...", "name": "Cardiology", "description": "..." },
    { "_id": "64def...", "name": "Dermatology", "description": "..." }
  ]
}
```

---

## 7. Admin

All admin endpoints require:  
`Authorization: Bearer <token>` with role `admin`

### 7.1 List Users

**`GET /api/admin/users`**

Retrieve all registered users with optional pagination.

**Query Parameters**

| Param  | Type   | Default |
|--------|--------|---------|
| role   | string | All roles |
| page   | number | 1       |
| limit  | number | 10      |

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 7.2 Approve Doctor

**`PATCH /api/admin/doctors/:id/approve`**

Approve a doctor so they appear in public listings and can receive appointments.

**Path Parameter:** `id` — doctor profile ObjectId

**Response `200`**

```json
{
  "success": true,
  "data": { "isApproved": true, ... }
}
```

---

### 7.3 Block / Unblock User

**`PATCH /api/admin/users/:id/block`**

Toggle the active status of a user. Blocked users cannot log in.

**Path Parameter:** `id` — user ObjectId

**Response `200`**

```json
{
  "success": true,
  "data": { "isActive": false, ... }
}
```

---

### 7.4 Get All Appointments

**`GET /api/admin/appointments`**

Retrieve all appointments across the system.

**Query Parameters**

| Param  | Type   | Default |
|--------|--------|---------|
| status | string | All statuses |
| page   | number | 1       |
| limit  | number | 10      |

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 7.5 Create Specialty

**`POST /api/admin/specialties`**

Add a new medical specialty.

**Request Body**

| Field       | Type   | Required |
|-------------|--------|----------|
| name        | string | Yes      |
| description | string | No       |

**Example**

```json
{
  "name": "Neurology",
  "description": "Diagnosis and treatment of disorders of the nervous system."
}
```

**Response `201`**

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Neurology", "description": "..." }
}
```

---

### 7.6 List Specialties (Admin)

**`GET /api/admin/specialties`**

List all specialties (admin view).

**Response `200`**

```json
{
  "success": true,
  "data": [ ... ]
}
```

---

### 7.7 Update Specialty

**`PUT /api/admin/specialties/:id`**

Update an existing specialty.

**Path Parameter:** `id` — specialty ObjectId

**Request Body**

| Field       | Type   | Required |
|-------------|--------|----------|
| name        | string | No       |
| description | string | No       |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### 7.8 Delete Specialty

**`DELETE /api/admin/specialties/:id`**

Remove a specialty permanently.

**Path Parameter:** `id` — specialty ObjectId

**Response `200`**

```json
{
  "success": true,
  "message": "Specialty deleted successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "status": "fail" | "error",
  "message": "Human-readable error message",
  "errors": [ { "field": "email", "message": "Email is required" } ]
}
```

| Status Code | Meaning                               |
|-------------|---------------------------------------|
| 400         | Bad Request / Validation Error        |
| 401         | Unauthorized — missing or invalid token |
| 403         | Forbidden — insufficient role         |
| 404         | Resource not found                    |
| 409         | Conflict — duplicate resource         |
| 429         | Too Many Requests — rate limit hit    |
| 500         | Internal Server Error                 |

---

## 8. Chat (REST + WebSocket)

All REST chat endpoints require authentication (`Bearer` token) and the user must have role **doctor** or **patient**.

### 8.1 Start Conversation

Create or retrieve an existing conversation between a doctor and a patient.

- **POST** `/api/chat/conversations`
- **Auth:** Required (doctor or patient)

**Body:**

| Field           | Type   | Required | Description                                     |
|-----------------|--------|----------|-------------------------------------------------|
| targetProfileId | string | Yes      | DoctorProfile `_id` (if patient) or Patient `_id` (if doctor) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "conversationId",
    "doctor": { "_id": "...", "user": { "name": "Dr. Smith", "email": "..." }, "specialty": { "name": "Cardiology" } },
    "patient": { "_id": "...", "user": { "name": "John", "email": "..." } },
    "lastMessage": null,
    "lastMessageAt": "2026-03-01T...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 8.2 List Conversations

Get all conversations for the authenticated user, sorted by most-recent message.

- **GET** `/api/chat/conversations?page=1&limit=10`
- **Auth:** Required (doctor or patient)

**Response (200):**

```json
{
  "success": true,
  "data": [ { "...conversation objects..." } ],
  "pagination": { "total": 5, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

### 8.3 Send Message

Send a message in an existing conversation (REST fallback — prefer WebSocket for real-time).

- **POST** `/api/chat/conversations/:conversationId/messages`
- **Auth:** Required (doctor or patient, must be participant)

**Body:**

| Field   | Type   | Required | Description              |
|---------|--------|----------|--------------------------|
| content | string | Yes      | Message text (max 2000)  |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "messageId",
    "conversation": "conversationId",
    "sender": { "_id": "...", "name": "...", "email": "...", "role": "doctor" },
    "senderRole": "doctor",
    "content": "Hello, how are you feeling?",
    "isRead": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 8.4 Get Messages

Retrieve paginated messages for a conversation (newest-last order).

- **GET** `/api/chat/conversations/:conversationId/messages?page=1&limit=50`
- **Auth:** Required (participant only)

**Response (200):**

```json
{
  "success": true,
  "data": [ { "...message objects..." } ],
  "pagination": { "total": 42, "page": 1, "limit": 50, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

### 8.5 Mark as Read

Mark all unread messages from the other participant as read.

- **PATCH** `/api/chat/conversations/:conversationId/read`
- **Auth:** Required (participant only)

**Response (200):**

```json
{ "success": true, "message": "Messages marked as read" }
```

### 8.6 Get Unread Count

Get total unread message count across all conversations.

- **GET** `/api/chat/unread-count`
- **Auth:** Required (doctor or patient)

**Response (200):**

```json
{ "success": true, "data": { "unreadCount": 3 } }
```

### 8.7 WebSocket Events

Connect via Socket.IO on the **same port** as the HTTP server.

**Connection:**

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "<JWT_TOKEN>" }
});
```

#### Client → Server Events

| Event                | Payload                                   | Callback                        | Description                        |
|----------------------|-------------------------------------------|---------------------------------|------------------------------------|
| `conversation:join`  | `conversationId` (string)                 | —                               | Join a conversation room           |
| `conversation:leave` | `conversationId` (string)                 | —                               | Leave a conversation room          |
| `message:send`       | `{ conversationId, content }`             | `{ success, message }` or `{ error }` | Send a message in real-time  |
| `typing:start`       | `{ conversationId }`                      | —                               | Notify others you are typing       |
| `typing:stop`        | `{ conversationId }`                      | —                               | Notify others you stopped typing   |
| `messages:read`      | `{ conversationId }`                      | `{ success }` or `{ error }`   | Mark messages as read              |
| `user:checkOnline`   | `targetUserId` (string)                   | `{ online: true/false }`       | Check if a user is online          |

#### Server → Client Events

| Event              | Payload                                                    | Description                                 |
|--------------------|------------------------------------------------------------|---------------------------------------------|
| `message:received` | `{ message, conversationId }`                              | New message in a joined conversation room   |
| `message:new`      | `{ conversationId, message }`                              | New message notification (personal room)    |
| `typing:start`     | `{ userId, name, conversationId }`                         | Someone started typing                      |
| `typing:stop`      | `{ userId, conversationId }`                               | Someone stopped typing                      |
| `messages:read`    | `{ conversationId, readBy }`                               | Messages were read by the other party       |
| `user:online`      | `{ userId }`                                               | A user came online                          |
| `user:offline`     | `{ userId }`                                               | A user went offline                         |
