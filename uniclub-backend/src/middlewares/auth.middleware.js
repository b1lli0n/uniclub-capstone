const jwt = require("jsonwebtoken");
const env = require("../config/env");

const secret = env.jwtSecret;

/**
 * Verify JWT token từ Authorization header
 * Expect: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or invalid format"
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Gắn user info vào request
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

/**
 * Middleware để check role (admin hoặc student)
 * Usage: protect(["admin"]) hoặc protect(["admin", "student"])
 */
const protect = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions"
      });
    }

    next();
  };
};

/**
 * Tạo JWT token
 * Usage: createToken({ id, email, role })
 */
const createToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: options.expiresIn || "7d"
  };
  return jwt.sign(payload, secret, defaultOptions);
};

module.exports = {
  verifyToken,
  protect,
  createToken
};
