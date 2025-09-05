const jwt = require("jsonwebtoken");

/**
 * Usage: adminAuth("Module:action") -> returns middleware
 * Checks JWT + (optionally) required permission attached by permissions middleware
 */
module.exports = function(requiredPermission = null) {
  return (req, res, next) => {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) return res.status(401).json({ status: "false", message: "No token" });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;

      if (requiredPermission) {
        const perms = (req.user && req.user.permissions) || [];
        if (!perms.includes(requiredPermission)) {
          return res.status(403).json({ status: "false", message: "Forbidden (permission)" });
        }
      }
      next();
    } catch (err) {
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }
  }
}