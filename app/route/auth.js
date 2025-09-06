// app/routes/auth.routes.js
const express = require("express");
const AuthCtrl = require("../controller/auth.js");

const router = express.Router();

// Authentication
router.post("/signup", AuthCtrl.signup);
router.post("/login", AuthCtrl.login);

module.exports = router;
