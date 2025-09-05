const jwt = require("jsonwebtoken");
const config = require("../../config");

// Generate JWT
const getToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.is_admin || false,
        isSeller: user.is_seller || false,
      },
      config.JWT_SECRET,
      {
        expiresIn: "277h",
      }
    );
  } catch (error) {
    console.error("❌ Token generation error:", error);
  }
};

// Auth middleware
const isAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ message: "Token is not supplied or malformed." });
    }

    const token = authHeader.slice(7); // remove "Bearer "

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Invalid Token" });
      }

      req.user = decoded; // attach decoded payload
      next();
    });
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Role middlewares
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: "Admin Token is not valid..." });
};

const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    return next();
  }
  return res.status(401).send({ message: "Invalid Seller Token" });
};

const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    return next();
  }
  return res.status(401).send({ message: "Invalid Admin/Seller Token" });
};

module.exports = {
  getToken,
  isAuth,
  isAdmin,
  isSeller,
  isSellerOrAdmin,
};
