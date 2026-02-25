import authService from "./auth.service.js";

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res) {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/verify-email
   */
  async verifyEmail(req, res) {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res) {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    const { resetToken, newPassword } = req.body;
    const result = await authService.resetPassword(resetToken, newPassword);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/auth/resend-otp
   */
  async resendOtp(req, res) {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    res.status(200).json({ success: true, ...result });
  }
}

export default new AuthController();
