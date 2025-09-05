// app/routes/role.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const RoleCtrl = require("../controller/role.controller");

const router = express.Router();

router.get("/roles", RoleCtrl.list);
router.get("/roles/:id", RoleCtrl.get);
router.post("/roles", RoleCtrl.create);
router.put("/roles/:id", RoleCtrl.update);
router.delete("/roles/:id", RoleCtrl.remove);

module.exports = router;
