const Joi = require("joi");
const { GENDER, ROLES } = require("../../core/config/constants");

const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(6)
      .max(128)
      .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
    phone: Joi.string()
      .pattern(/^01[0125][0-9]{8}$/)
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
      }),
    gender: Joi.string().valid(...Object.values(GENDER)),
    dateOfBirth: Joi.date().max("now").messages({
      "date.max": "Date of birth cannot be in the future",
    }),
    address: Joi.string().trim().max(200),
    role: Joi.string()
      .valid(ROLES.PATIENT, ROLES.DOCTOR)
      .default(ROLES.PATIENT),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};

const verifyEmailSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    otp: Joi.string().length(6).required().messages({
      "string.length": "OTP must be 6 digits",
      "any.required": "OTP is required",
    }),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
  }),
};

const verifyOtpSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    otp: Joi.string().length(6).required().messages({
      "string.length": "OTP must be 6 digits",
      "any.required": "OTP is required",
    }),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    resetToken: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "New password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
  }),
};

const resendOtpSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  resendOtpSchema,
};
