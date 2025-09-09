const jwt = require("jsonwebtoken");
require("dotenv").config();
const { UserBranchRole, Role, Permission } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET



// Generate JWT
const getToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.is_admin || false,
        isSeller: user.is_seller || false,
      },
      JWT_SECRET,
      {
        expiresIn: "277h",
      }
    );
  } catch (error) {
    console.error("❌ Token generation error:", error);
  }
};

const isAuth = (req, res, next) => {
  try {
    // Try both: "Authorization: Bearer <token>" OR "x-auth-token: <token>"
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // remove "Bearer "
    } else if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token is not supplied or malformed." });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid Token" });
      }

      // Attach decoded payload to request
      req.user = decoded; // { id, isAdmin, isSeller, ... }

      next();
    });
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(400).json({ message: "Internal Server Error" });
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