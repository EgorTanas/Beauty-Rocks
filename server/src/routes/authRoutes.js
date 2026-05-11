const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("../config/passport");
const {
  register,
  login,
  logout,
  getMe,
  refreshTokens,
  googleCallback,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ── Validation helper ──
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerRules = [
  body("username").trim().isLength({ min: 2, max: 50 }).withMessage("Username must be between 2 and 50 characters"),
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").matches(/\d/).withMessage("Password must contain at least one number"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Local auth routes ──
router.post("/register", registerRules, validate, register);
router.post("/login",    loginRules,    validate, login);
router.post("/logout",   protect,               logout);
router.get("/me",        protect,               getMe);
router.post("/refresh",                         refreshTokens);

// ── Google OAuth routes 

// Step 1: Redirect user to Google's consent screen
// Frontend calls: window.location.href = 'http://localhost:5000/api/auth/google'
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // we use JWT, not sessions
  })
);

// Step 2: Google redirects back here after user consents
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

module.exports = router;