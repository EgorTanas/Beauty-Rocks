const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { attachTokenCookies, clearTokenCookies, verifyRefreshToken } = require("../utils/jwt");

// ── Register
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

    const { refreshToken } = attachTokenCookies(res, user);
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return res.status(201).json({
      message: "Account created successfully.",
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

// ── Login 
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

// ── Google OAuth Callback 
// Passport populates req.user after successful Google auth.
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }

    // Issue JWT cookies (same as local login)
    const { refreshToken } = attachTokenCookies(res, user);

    // Store hashed refresh token
    const salt = await bcrypt.genSalt(10);
    const fullUser = await User.findById(user._id).select("+refreshToken");
    fullUser.refreshToken = await bcrypt.hash(refreshToken, salt);
    await fullUser.save({ validateBeforeSave: false });

    // Redirect frontend to a success route — pass only safe public data
    const userData = encodeURIComponent(JSON.stringify(user.toPublicJSON()));
    return res.redirect(`${process.env.CLIENT_URL}/auth/google/success?user=${userData}`);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// ── Logout 
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

// ── Get current user 
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

// ── Manual refresh
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