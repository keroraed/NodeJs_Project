import nodemailer from "nodemailer";
import appConfig from "../config/app.config.js";
import { OTP_EXPIRY_MINUTES } from "../config/constants.js";
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
  const otpTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.08);">
            <tr>
              <td style="padding:28px 28px 12px;text-align:center;">
                <img
                  src="https://i.postimg.cc/y6FVr6ws/Chat-GPT-Image-26-fbrayr-2026-09-16-04-m.png"
                  alt="MedAppoint Logo"
                  width="220"
                  style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
                />
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;padding:36px 32px;font-family:'Inter',system-ui,-apple-system,sans-serif;">
                <p style="margin:0 0 10px;color:#0a0a0a;font-size:20px;font-weight:600;line-height:1.4;">Hello, ${name}</p>
                <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.7;">
                  Use the one-time passcode below to securely verify your MedAppoint account.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#eff6ff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 32px;">
                      <p style="margin:0;color:#2563eb;font-size:36px;font-weight:700;letter-spacing:12px;line-height:1.1;">{{OTP_CODE}}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-top:14px;">
                      <span style="display:inline-block;background-color:#f1f5f9;color:#64748b;font-size:13px;line-height:1.2;padding:6px 16px;border-radius:20px;">Valid for {{EXPIRY_MINUTES}} minutes</span>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                  <tr>
                    <td style="background-color:#ecfeff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;">
                      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                        <span style="font-size:14px;line-height:1;">&#128737;&#65039;</span> If you didn't request this code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f1f5f9;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:18px 24px;text-align:center;font-family:'Inter',system-ui,-apple-system,sans-serif;">
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;font-weight:600;">MedAppoint</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.5;">Your Health, Our Priority</p>
                <p style="margin:2px 0 0;color:#64748b;font-size:12px;line-height:1.5;">&copy; ${new Date().getFullYear()} MedAppoint. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const html = otpTemplate
    .replace("{{OTP_CODE}}", otp)
    .replace("{{EXPIRY_MINUTES}}", String(OTP_EXPIRY_MINUTES));

  return sendEmail({
    to,
    subject: "Email Verification - MedAppoint",
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
  const passwordResetTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.08);">
            <tr>
              <td style="padding:28px 28px 12px;text-align:center;">
                <img
                  src="https://i.postimg.cc/y6FVr6ws/Chat-GPT-Image-26-fbrayr-2026-09-16-04-m.png"
                  alt="MedAppoint Logo"
                  width="220"
                  style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
                />
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;padding:36px 32px;font-family:'Inter',system-ui,-apple-system,sans-serif;">
                <p style="margin:0 0 10px;color:#0a0a0a;font-size:20px;font-weight:600;line-height:1.4;">Hello, ${name}</p>
                <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.7;">
                  We received a request to reset your password. Use the one-time code below to continue.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#eff6ff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 32px;">
                      <p style="margin:0;color:#2563eb;font-size:36px;font-weight:700;letter-spacing:12px;line-height:1.1;">{{OTP_CODE}}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-top:14px;">
                      <span style="display:inline-block;background-color:#f1f5f9;color:#64748b;font-size:13px;line-height:1.2;padding:6px 16px;border-radius:20px;">Valid for {{EXPIRY_MINUTES}} minutes</span>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                  <tr>
                    <td style="background-color:#ecfeff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;">
                      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                        <span style="font-size:14px;line-height:1;">&#128737;&#65039;</span> If you didn't request this password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                  <tr>
                    <td align="center" style="padding-top:4px;">
                      <span style="display:inline-block;color:#ef4444;font-size:13px;line-height:1.4;">Never share this code with anyone.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f1f5f9;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:18px 24px;text-align:center;font-family:'Inter',system-ui,-apple-system,sans-serif;">
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;font-weight:600;">MedAppoint</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.5;">Your Health, Our Priority</p>
                <p style="margin:2px 0 0;color:#64748b;font-size:12px;line-height:1.5;">&copy; ${new Date().getFullYear()} MedAppoint. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const html = passwordResetTemplate
    .replace("{{OTP_CODE}}", otp)
    .replace("{{EXPIRY_MINUTES}}", String(OTP_EXPIRY_MINUTES));

  return sendEmail({
    to,
    subject: "Password Reset - MedAppoint",
    html,
  });
};
export { sendEmail, sendOtpEmail, sendPasswordResetEmail };
