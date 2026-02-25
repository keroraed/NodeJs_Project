// User Roles
const ROLES = Object.freeze({
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
});

// Appointment Status
const APPOINTMENT_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

// Gender
const GENDER = Object.freeze({
  MALE: "male",
  FEMALE: "female",
});

// OTP
const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

// Pagination
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Appointment status state machine
const VALID_STATUS_TRANSITIONS = Object.freeze({
  [APPOINTMENT_STATUS.PENDING]: [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.CANCELLED,
  ],
  [APPOINTMENT_STATUS.CONFIRMED]: [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
  ],
  [APPOINTMENT_STATUS.CANCELLED]: [],
  [APPOINTMENT_STATUS.COMPLETED]: [],
});

export {
  ROLES,
  APPOINTMENT_STATUS,
  GENDER,
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  VALID_STATUS_TRANSITIONS,
};
