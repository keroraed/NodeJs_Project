const { Router } = require("express");
const authController = require("./auth.controller");
const validate = require("../../core/middlewares/validate.middleware");
const { authLimiter } = require("../../core/middlewares/rateLimit.middleware");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require("./auth.validation");

const router = Router();

// All auth routes are public (with rate limiting)
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

router.post(
  "/verify-email",
  authLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp,
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

module.exports = router;
