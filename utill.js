import jwt from 'jsonwebtoken';
import config from './config.js';
// const nodemailer = require('nodemailer');

const getToken = (user) => {
  
    try {
      
        return jwt.sign(
            {
              id: user.id
            },
            config.JWT_SECRET,
            {
              expiresIn: '277h',
            }
          );
    } catch (error) {
        console.log(error)
    }
  
};


const isAuth = (req, res, next) => {
  try {
    // Log the authorization header for debugging
    // console.log('Authorization Header:', req.headers.authorization);

    // Extract the token from the header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Token is not supplied or malformed.' });
    }

    // Remove the "Bearer " prefix
    const token = authHeader.slice(7, authHeader.length);

    // Verify the token
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      // Attach decoded user info to the request object
      req.user = decoded;      

      // Pass control to the next middleware or route
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user && req.user.isAdmin) {
    console.log("success for the admin");
    return next();
  }
  console.log("fail for the admin");
  return res.status(401).send({ message: "Admin Token is not valid..." });
}

const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token' });
  }
};
const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token' });
  }
};

export {
  getToken, isAdmin, isAuth ,isSeller , isSellerOrAdmin
}
