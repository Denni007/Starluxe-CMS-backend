// app/routes/permission.routes.js
const express = require("express");
const PermissionCtrl = require("../controller/permission.js");

const router = express.Router();

router.get("/", PermissionCtrl.list);
router.post("/", PermissionCtrl.create);

module.exports = router;
