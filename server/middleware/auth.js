const jwt = require("jsonwebtoken");

// Route guard for endpoints that require a logged-in user.
// Reads a Bearer token, verifies it, and attaches the payload to req.user.
const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Same token parsing as `auth`, but never blocks the request — attaches
// req.user when a valid token is present, otherwise proceeds unauthenticated.
// For routes that must work for both logged-out visitors and logged-in users.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Invalid/expired token — treat as unauthenticated rather than rejecting.
    }
  }

  next();
};

auth.optionalAuth = optionalAuth;
module.exports = auth;
