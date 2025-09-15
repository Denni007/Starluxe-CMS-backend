// app/routes/role.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const RoleCtrl = require("../controller/role.js");

const router = express.Router();

router.get("/", isAuth, RoleCtrl.list);
router.get("/:id", isAuth, RoleCtrl.get);
router.get("/branch/:id", RoleCtrl.listByBranch);
router.get("/branch/user/:id", RoleCtrl.listByBranchUser);

router.post("/", isAuth, RoleCtrl.createWithPermissions);
router.patch("/:id", isAuth, RoleCtrl.updateRole);
router.delete("/:id", isAuth, RoleCtrl.remove);

module.exports = router;
