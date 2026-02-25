import nodemailer from "nodemailer";
import appConfig from "../config/app.config.js";
import logger from "../logger/logger.js";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: appConfig.email.smtpServer,
  port: appConfig.email.smtpPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: appConfig.email.username,
    pass: appConfig.email.password,
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<Object>} Nodemailer info
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Medical Appointments" <${appConfig.email.senderEmail}>`,
      to,
      subject,
      html,
      text: text || "",
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 */
const sendOtpEmail = async (to, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your OTP verification code is:</p>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #007bff; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">Medical Appointment System</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Email Verification - Medical Appointment System",
    html,
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (to, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Password Reset</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have requested to reset your password. Use the code below:</p>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #dc3545; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">Medical Appointment System</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Password Reset - Medical Appointment System",
    html,
  });
};

export { sendEmail, sendOtpEmail, sendPasswordResetEmail };
