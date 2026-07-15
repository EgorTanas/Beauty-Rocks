const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "Missing JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env"
  );
}

// ── Token generation

/**
 * Generate a short-lived access token (15 minutes)
 * Contains: userId, role — nothing sensitive
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generate a long-lived refresh token (7 days)
 * Contains only userId — used only to issue new access tokens
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// ── Token verification 

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// ── Cookie options 

const isProduction = process.env.NODE_ENV === "production";
const cookieSameSite = (process.env.AUTH_COOKIE_SAMESITE || (isProduction ? "None" : "Lax")).trim();
const cookieSecure = process.env.AUTH_COOKIE_SECURE
  ? process.env.AUTH_COOKIE_SECURE !== "false"
  : isProduction;

const COOKIE_BASE = {
  httpOnly: true,                                  // JS cannot read
  secure: cookieSecure,                            // HTTPS only when enabled
  sameSite: cookieSameSite,
  path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 15 * 60 * 1000, // 15 minutes in ms
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/**
 * Attach both tokens as httpOnly cookies on the response
 */
const attachTokenCookies = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return { accessToken, refreshToken };
};

/**
 * Clear both auth cookies (used on logout)
 */
const clearTokenCookies = (res) => {
  const clearOptions = { ...COOKIE_BASE, maxAge: 0 };
  res.cookie("accessToken", "", clearOptions);
  res.cookie("refreshToken", "", clearOptions);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  attachTokenCookies,
  clearTokenCookies,
};
