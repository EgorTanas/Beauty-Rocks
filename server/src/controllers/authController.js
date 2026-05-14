const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { attachTokenCookies, clearTokenCookies, verifyRefreshToken } = require("../utils/jwt");
const { sendEmail, sendPasswordResetEmail, sendEmailVerificationEmail } = require("../utils/email");


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const user = await User.create({ username, email, password });
    try {
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendEmailVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
    }
    const { refreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+password +refreshToken");
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been disabled." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const { refreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "Logged in successfully.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
    const { refreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    const fullUser = await User.findById(user._id).select("+refreshToken");
    fullUser.refreshToken = await bcrypt.hash(refreshToken, salt);
    await fullUser.save({ validateBeforeSave: false });
    const userData = encodeURIComponent(JSON.stringify(user.toPublicJSON()));
    return res.redirect(`${process.env.CLIENT_URL}/auth/google/success?user=${userData}`);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }
    clearTokenCookies(res);
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || !user.isActive || !user.refreshToken) {
      return res.status(401).json({ message: "Session is invalid." });
    }
    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValid) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ message: "Token reuse detected. Please log in again." });
    }
    const { refreshToken: newRefreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(newRefreshToken, salt);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Tokens refreshed." });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    const successMsg = "If an account with that email exists, a reset link has been sent.";
    if (!user) {
      return res.status(200).json({ message: successMsg });
    }
    if (!user.password) {
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Beauty Rocks — Your account uses Google Sign-In',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(212,73,122,0.10)">
          <h2 style="color:#d4497a">💄 Beauty Rocks</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>We received a password reset request for this email, but your account was created using <strong>Google Sign-In</strong> — it doesn't have a password.</p>
          <p>To access your account, simply click <strong>"Continue with Google"</strong> on the login page.</p>
          <a href="${process.env.CLIENT_URL}/login" 
             style="display:inline-block;background:#d4497a;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:8px">
            Go to Login
          </a>
          <p style="color:#999;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Failed to send Google account notice:', emailErr.message);
  }
  return res.status(200).json({ message: successMsg }); // tot 200 — nu dezvăluim
}
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
      await sendPasswordResetEmail(user, rawToken);
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Failed to send reset email:", emailErr.message);
      return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }
    return res.status(200).json({ message: successMsg });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({ message: "Internal server error." });
    
  }
  
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password +passwordResetToken +passwordResetExpires");
    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null;
    await user.save();
    const { refreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "Password reset successfully. You are now logged in.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("ResetPassword error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired." });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error("VerifyEmail error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendEmailVerificationEmail(user, verificationToken);
    return res.status(200).json({ message: "Verification email resent. Please check your inbox." });
  } catch (error) {
    console.error("ResendVerification error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};