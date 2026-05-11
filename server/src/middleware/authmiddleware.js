const User = require("../models/User");
const { verifyAccessToken, verifyRefreshToken, attachTokenCookies } = require("../utils/jwt");


const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;


    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        req.user = { id: decoded.id, role: decoded.role };
        return next();
      } catch (err) {
        
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
      }
    }


    if (!refreshToken) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    
    const user = await User.findById(decoded.id).select("+refreshToken +password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or account disabled." });
    }

     
    const bcrypt = require("bcryptjs");
    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken || "");
    if (!tokenValid) {
      return res.status(401).json({ message: "Invalid session. Please log in again." });
    }

     
    const { refreshToken: newRefreshToken } = attachTokenCookies(res, user);

    
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(newRefreshToken, salt);
    await user.save({ validateBeforeSave: false });

    req.user = { id: user._id, role: user.role };
    return next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error." });
  }
};


const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };