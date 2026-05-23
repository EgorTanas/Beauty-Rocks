const express = require("express");
const { body, query, validationResult } = require("express-validator");
const passport = require("../config/Passport");
const rateLimit = require("express-rate-limit");

// Max 10 încercări login / 15 minute per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Prea multe încercări de autentificare. Încearcă din nou în 15 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Max 5 cereri forgot-password / oră per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Prea multe cereri de resetare parolă. Încearcă din nou mai târziu." },
  standardHeaders: true,
  legacyHeaders: false,
});

const {
  register,
  login,
  logout,
  getMe,
  refreshTokens,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
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
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
];

router.post("/register",  registerRules,       validate, register);
router.post("/login",     loginLimiter, loginRules, validate, login);
router.post("/logout",    protect,                       logout);
router.get("/me",         protect,                       getMe);
router.post("/refresh",                                  refreshTokens);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password",  resetPasswordRules,  validate, resetPassword);
router.get("/verify-email",           verifyEmail);
router.post("/resend-verification",   protect, resendVerification);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

module.exports = router;