const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader) {
      // If starts with "Bearer ", use the second part; otherwise use the full header
      token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if user role is allowed
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }
  };
};

module.exports = auth;
