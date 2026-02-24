const crypto = require("crypto");
const mongoose = require("mongoose");
const authRepository = require("./auth.repository");
const ApiError = require("../../core/errors/ApiError");
const {
  hashValue,
  compareValue,
  hashToken,
} = require("../../core/utils/hash.util");
const { generateToken } = require("../../core/utils/token.util");
const generateOtp = require("../../core/utils/generateOtp");
const {
  sendOtpEmail,
  sendPasswordResetEmail,
} = require("../../core/utils/sendEmail.util");
const { addMinutes, isExpired } = require("../../core/utils/date.util");
const { OTP_EXPIRY_MINUTES, ROLES } = require("../../core/config/constants");
const Patient = require("../patients/patient.model");
const DoctorProfile = require("../doctors/doctor.model");

class AuthService {
  /**
   * Register a new user (patient or doctor), send OTP email
   */
  async register(userData) {
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict("Email already registered");
    }

    const hashedPassword = await hashValue(userData.password);
    const otp = generateOtp();
    const hashedOtp = await hashValue(otp);

    const session = await mongoose.startSession();
    session.startTransaction();
    let user;
    try {
      user = await authRepository.create(
        {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || ROLES.PATIENT,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
          otp: hashedOtp,
          otpExpiry: addMinutes(new Date(), OTP_EXPIRY_MINUTES),
        },
        session,
      );

      // Auto-create profile based on role
      if (user.role === ROLES.PATIENT) {
        await Patient.create([{ user: user._id }], { session });
      } else if (user.role === ROLES.DOCTOR) {
        await DoctorProfile.create([{ user: user._id }], { session });
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    await sendOtpEmail(user.email, otp, user.name);

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Verify email with OTP { email, otp }
   */
  async verifyEmail(email, otpCode) {
    const user = await authRepository.findByEmail(
      email,
      "+otp +otpExpiry +otpAttempts",
    );

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    if (!user.otp) {
      throw ApiError.badRequest("No OTP found. Please request a new one.");
    }

    if (user.otpAttempts >= 5) {
      throw ApiError.tooManyRequests(
        "Too many failed attempts. Please request a new OTP.",
      );
    }

    if (isExpired(user.otpExpiry)) {
      throw ApiError.badRequest("OTP has expired. Please request a new one.");
    }

    const isOtpValid = await compareValue(otpCode, user.otp);
    if (!isOtpValid) {
      await authRepository.updateById(user._id, {
        otpAttempts: (user.otpAttempts || 0) + 1,
      });
      throw ApiError.badRequest("Invalid OTP code");
    }

    await authRepository.updateById(user._id, {
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
    });

    return { message: "Email verified successfully" };
  }

  /**
   * Login (must be verified), returns JWT with { userId, role }
   */
  async login(email, password) {
    const user = await authRepository.findByEmail(email, "+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isVerified) {
      throw ApiError.forbidden("Please verify your email before logging in");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Your account has been blocked");
    }

    const token = generateToken({ userId: user._id, role: user.role });

    return {
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Forgot password — send OTP to email
   */
  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return {
        message:
          "If the email is registered, you will receive a password reset OTP.",
      };
    }

    const otp = generateOtp();
    const hashedOtp = await hashValue(otp);

    await authRepository.updateById(user._id, {
      otp: hashedOtp,
      otpExpiry: addMinutes(new Date(), OTP_EXPIRY_MINUTES),
      otpAttempts: 0,
    });

    await sendPasswordResetEmail(user.email, otp, user.name);

    return {
      message:
        "If the email is registered, you will receive a password reset OTP.",
    };
  }

  /**
   * Verify OTP for password reset — returns reset token
   */
  async verifyOtp(email, otpCode) {
    const user = await authRepository.findByEmail(
      email,
      "+otp +otpExpiry +otpAttempts",
    );

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!user.otp) {
      throw ApiError.badRequest("No OTP was requested");
    }

    if (user.otpAttempts >= 5) {
      throw ApiError.tooManyRequests(
        "Too many failed attempts. Please request a new OTP.",
      );
    }

    if (isExpired(user.otpExpiry)) {
      throw ApiError.badRequest("OTP has expired");
    }

    const isOtpValid = await compareValue(otpCode, user.otp);
    if (!isOtpValid) {
      await authRepository.updateById(user._id, {
        otpAttempts: (user.otpAttempts || 0) + 1,
      });
      throw ApiError.badRequest("Invalid OTP code");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = hashToken(resetToken);
    const resetTokenExpiry = addMinutes(new Date(), 15); // 15 minutes

    await authRepository.updateById(user._id, {
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      resetToken: hashedResetToken,
      resetTokenExpiry,
    });

    return { message: "OTP verified successfully", resetToken };
  }

  /**
   * Reset password with { resetToken, newPassword, confirmPassword }
   */
  async resetPassword(resetToken, newPassword) {
    const hashedToken = hashToken(resetToken);
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    if (isExpired(user.resetTokenExpiry)) {
      throw ApiError.badRequest("Reset token has expired");
    }

    const hashedPassword = await hashValue(newPassword);

    await authRepository.updateById(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return {
      message:
        "Password reset successfully. Please login with your new password.",
    };
  }

  /**
   * Resend OTP for email verification
   */
  async resendOtp(email) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return { message: "If the email is registered, a new OTP will be sent." };
    }

    if (user.isVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    const otp = generateOtp();
    const hashedOtp = await hashValue(otp);

    await authRepository.updateById(user._id, {
      otp: hashedOtp,
      otpExpiry: addMinutes(new Date(), OTP_EXPIRY_MINUTES),
      otpAttempts: 0,
    });

    await sendOtpEmail(user.email, otp, user.name);

    return { message: "If the email is registered, a new OTP will be sent." };
  }
}

module.exports = new AuthService();
