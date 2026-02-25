const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Medical Appointment System API",
    version: "1.0.0",
    description:
      "RESTful API for managing doctors, patients, and appointments in a medical system.",
    contact: {
      name: "Medical Appointment System",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token",
      },
    },
    schemas: {
      // ─── Common ──────────────────────────────────────────────
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: { type: "array", items: { type: "string" } },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
          pages: { type: "integer", example: 10 },
        },
      },
      ObjectId: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
        example: "64f1a2b3c4d5e6f7a8b9c0d1",
      },

      // ─── Auth ─────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 50,
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            minLength: 6,
            example: "Secret@123",
            description:
              "Must contain uppercase, lowercase, digit and special char",
          },
          phone: {
            type: "string",
            example: "01012345678",
            description: "Egyptian phone number",
          },
          gender: { type: "string", enum: ["male", "female"] },
          dateOfBirth: {
            type: "string",
            format: "date",
            example: "1995-06-15",
          },
          address: {
            type: "string",
            maxLength: 200,
            example: "123 Main St, Cairo",
          },
          role: {
            type: "string",
            enum: ["patient", "doctor"],
            default: "patient",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: { type: "string", example: "Secret@123" },
        },
      },
      OtpEmailRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          otp: {
            type: "string",
            minLength: 6,
            maxLength: 6,
            example: "123456",
          },
        },
      },
      EmailRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["resetToken", "newPassword", "confirmPassword"],
        properties: {
          resetToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          newPassword: {
            type: "string",
            minLength: 6,
            example: "NewSecret@123",
          },
          confirmPassword: { type: "string", example: "NewSecret@123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/UserProfile" },
              token: { type: "string", description: "JWT access token" },
            },
          },
        },
      },

      // ─── User / Profile ───────────────────────────────────────
      UserProfile: {
        type: "object",
        properties: {
          _id: { $ref: "#/components/schemas/ObjectId" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          role: { type: "string", enum: ["admin", "doctor", "patient"] },
          phone: { type: "string", example: "01012345678" },
          gender: { type: "string", enum: ["male", "female"] },
          dateOfBirth: { type: "string", format: "date" },
          address: { type: "string" },
          isEmailVerified: { type: "boolean" },
          isBlocked: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ─── Patient ──────────────────────────────────────────────
      PatientProfile: {
        allOf: [
          { $ref: "#/components/schemas/UserProfile" },
          {
            type: "object",
            properties: {
              medicalHistory: { type: "string", example: "No known allergies" },
            },
          },
        ],
      },
      UpdatePatientProfileRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          medicalHistory: {
            type: "string",
            maxLength: 5000,
            example: "Diabetic, no known allergies",
          },
        },
      },

      // ─── Doctor ───────────────────────────────────────────────
      Slot: {
        type: "object",
        required: ["startTime", "endTime"],
        properties: {
          startTime: {
            type: "string",
            pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
            example: "09:00",
          },
          endTime: {
            type: "string",
            pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
            example: "09:30",
          },
        },
      },
      AvailabilityEntry: {
        type: "object",
        required: ["day", "slots"],
        properties: {
          day: {
            type: "string",
            enum: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
          },
          slots: {
            type: "array",
            items: { $ref: "#/components/schemas/Slot" },
          },
        },
      },
      DoctorProfile: {
        allOf: [
          { $ref: "#/components/schemas/UserProfile" },
          {
            type: "object",
            properties: {
              specialty: { $ref: "#/components/schemas/Specialty" },
              bio: {
                type: "string",
                example: "Experienced cardiologist with 10 years of practice",
              },
              availability: {
                type: "array",
                items: { $ref: "#/components/schemas/AvailabilityEntry" },
              },
              isApproved: { type: "boolean" },
            },
          },
        ],
      },
      UpdateDoctorProfileRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          specialty: { $ref: "#/components/schemas/ObjectId" },
          bio: {
            type: "string",
            maxLength: 1000,
            example: "Expert in cardiology",
          },
          availability: {
            type: "array",
            items: { $ref: "#/components/schemas/AvailabilityEntry" },
          },
        },
      },

      // ─── Specialty ────────────────────────────────────────────
      Specialty: {
        type: "object",
        properties: {
          _id: { $ref: "#/components/schemas/ObjectId" },
          name: { type: "string", example: "Cardiology" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateSpecialtyRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "Cardiology",
          },
        },
      },

      // ─── Appointment ──────────────────────────────────────────
      Appointment: {
        type: "object",
        properties: {
          _id: { $ref: "#/components/schemas/ObjectId" },
          patient: { $ref: "#/components/schemas/UserProfile" },
          doctor: { $ref: "#/components/schemas/DoctorProfile" },
          date: { type: "string", format: "date", example: "2026-03-01" },
          startTime: { type: "string", example: "10:00" },
          endTime: { type: "string", example: "10:30" },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "cancelled", "completed"],
          },
          notes: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      BookAppointmentRequest: {
        type: "object",
        required: ["doctor", "date", "startTime", "endTime"],
        properties: {
          doctor: { $ref: "#/components/schemas/ObjectId" },
          date: { type: "string", format: "date", example: "2026-03-01" },
          startTime: {
            type: "string",
            example: "10:00",
            description: "Format: HH:mm",
          },
          endTime: {
            type: "string",
            example: "10:30",
            description: "Format: HH:mm",
          },
        },
      },
      UpdatePatientAppointmentRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          status: { type: "string", enum: ["cancelled"] },
          date: { type: "string", format: "date", example: "2026-03-05" },
          startTime: { type: "string", example: "11:00" },
          endTime: { type: "string", example: "11:30" },
        },
      },
      UpdateDoctorAppointmentRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          status: {
            type: "string",
            enum: ["confirmed", "cancelled", "completed"],
          },
          notes: {
            type: "string",
            maxLength: 2000,
            example: "Patient requires follow-up",
          },
        },
      },
    },
  },

  paths: {
    // ═══════════════════════════════════════════════════════════
    //  HEALTH
    // ═══════════════════════════════════════════════════════════
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Verify that the API server is running.",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "Medical Appointment System API is running",
                    },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  AUTH
    // ═══════════════════════════════════════════════════════════
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Creates a patient or doctor account. An OTP is sent to the email for verification.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered, OTP sent to email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with OTP",
        description:
          "Confirm the user's email address using the 6-digit OTP sent during registration.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OtpEmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Email verified successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/resend-otp": {
      post: {
        tags: ["Auth"],
        summary: "Resend email verification OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OTP resent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Email already verified or not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description:
          "Authenticate with email and password. Returns a JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials or unverified email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset",
        description: "Sends a password-reset OTP to the provided email.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Reset OTP sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          404: {
            description: "Email not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify password-reset OTP",
        description:
          "Returns a short-lived reset token to be used in the reset-password step.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OtpEmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OTP verified – reset token returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: { resetToken: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        description:
          "Set a new password using the reset token obtained from verify-otp.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid token or passwords do not match",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  PATIENTS
    // ═══════════════════════════════════════════════════════════
    "/patients/profile": {
      get: {
        tags: ["Patients"],
        summary: "Get patient profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Patient profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/PatientProfile" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – not a patient" },
        },
      },
      put: {
        tags: ["Patients"],
        summary: "Update patient profile",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdatePatientProfileRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/patients/appointments": {
      get: {
        tags: ["Patients"],
        summary: "Get patient appointments",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
            },
          },
        ],
        responses: {
          200: {
            description: "List of appointments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        appointments: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Appointment" },
                        },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/patients/appointments/{id}": {
      patch: {
        tags: ["Patients"],
        summary: "Cancel or reschedule an appointment",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdatePatientAppointmentRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Appointment updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          404: { description: "Appointment not found" },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  DOCTORS
    // ═══════════════════════════════════════════════════════════
    "/doctors": {
      get: {
        tags: ["Doctors"],
        summary: "List all approved doctors (public)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "specialty",
            in: "query",
            schema: { $ref: "#/components/schemas/ObjectId" },
            description: "Filter by specialty ID",
          },
          {
            name: "name",
            in: "query",
            schema: { type: "string" },
            description: "Search by name",
          },
        ],
        responses: {
          200: {
            description: "List of doctors",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        doctors: {
                          type: "array",
                          items: { $ref: "#/components/schemas/DoctorProfile" },
                        },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/doctors/profile": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor's own profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Doctor profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DoctorProfile" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – not a doctor" },
        },
      },
      put: {
        tags: ["Doctors"],
        summary: "Update doctor's own profile",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateDoctorProfileRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/doctors/appointments": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor's appointments",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
            },
          },
        ],
        responses: {
          200: {
            description: "List of appointments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        appointments: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Appointment" },
                        },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – not a doctor" },
        },
      },
    },
    "/doctors/appointments/{id}": {
      patch: {
        tags: ["Doctors"],
        summary: "Confirm, cancel, or complete an appointment",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateDoctorAppointmentRequest",
              },
            },
          },
        },
        responses: {
          200: { description: "Appointment updated" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          404: { description: "Appointment not found" },
        },
      },
    },
    "/doctors/{id}": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor by ID (public)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        responses: {
          200: {
            description: "Doctor profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DoctorProfile" },
                  },
                },
              },
            },
          },
          404: { description: "Doctor not found" },
        },
      },
    },
    "/doctors/{id}/availability": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor's available time slots (public)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
          {
            name: "date",
            in: "query",
            schema: { type: "string", format: "date", example: "2026-03-01" },
            description: "Filter slots for a specific date",
          },
        ],
        responses: {
          200: {
            description: "Available slots",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AvailabilityEntry" },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Doctor not found" },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  APPOINTMENTS
    // ═══════════════════════════════════════════════════════════
    "/appointments": {
      post: {
        tags: ["Appointments"],
        summary: "Book an appointment (Patient only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookAppointmentRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Appointment booked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Appointment" },
                  },
                },
              },
            },
          },
          400: { description: "Slot not available or validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – only patients can book" },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  SPECIALTIES
    // ═══════════════════════════════════════════════════════════
    "/specialties": {
      get: {
        tags: ["Specialties"],
        summary: "List all specialties (public)",
        responses: {
          200: {
            description: "List of specialties",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Specialty" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  ADMIN
    // ═══════════════════════════════════════════════════════════
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["admin", "doctor", "patient"] },
          },
        ],
        responses: {
          200: { description: "Paginated list of users" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden – admin only" },
        },
      },
    },
    "/admin/doctors/{id}/approve": {
      patch: {
        tags: ["Admin"],
        summary: "Approve a doctor",
        description:
          "Grants the doctor access to the system after reviewing their profile.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        responses: {
          200: {
            description: "Doctor approved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Doctor not found" },
        },
      },
    },
    "/admin/users/{id}/block": {
      patch: {
        tags: ["Admin"],
        summary: "Block or unblock a user",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        responses: {
          200: {
            description: "User blocked/unblocked",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "User not found" },
        },
      },
    },
    "/admin/appointments": {
      get: {
        tags: ["Admin"],
        summary: "Get all appointments",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
            },
          },
        ],
        responses: {
          200: { description: "List of all appointments" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/admin/specialties": {
      get: {
        tags: ["Admin"],
        summary: "List all specialties (admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of specialties" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a specialty",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSpecialtyRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Specialty created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Specialty" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error or duplicate name" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/admin/specialties/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update a specialty",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSpecialtyRequest" },
            },
          },
        },
        responses: {
          200: { description: "Specialty updated" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Specialty not found" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete a specialty",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { $ref: "#/components/schemas/ObjectId" },
          },
        ],
        responses: {
          200: { description: "Specialty deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Specialty not found" },
        },
      },
    },
  },

  tags: [
    { name: "Health", description: "Server health check" },
    {
      name: "Auth",
      description: "Registration, login, email verification and password reset",
    },
    {
      name: "Patients",
      description: "Patient profile and appointment management",
    },
    {
      name: "Doctors",
      description: "Doctor profile, availability and appointment management",
    },
    { name: "Appointments", description: "Book appointments (patient action)" },
    {
      name: "Specialties",
      description: "Medical specialties (public listing)",
    },
    { name: "Admin", description: "Admin-only management endpoints" },
  ],
};

export default swaggerDefinition;
