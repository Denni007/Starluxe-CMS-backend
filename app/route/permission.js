// app/routes/permission.routes.js
const express = require("express");
const PermissionCtrl = require("../controller/permission.controller");

const router = express.Router();

router.get("/", PermissionCtrl.list);
router.post("/", PermissionCtrl.create);

module.exports = router;
