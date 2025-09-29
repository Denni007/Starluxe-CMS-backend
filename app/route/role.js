// app/routes/role.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill");
const RoleCtrl = require("../controller/role.js");

const router = express.Router();

router.get("/", isAuth, isPermission, RoleCtrl.list);
router.get("/:id", isAuth, isPermission, RoleCtrl.get);
router.get("/branch/:id", isAuth, isPermission, RoleCtrl.listByBranch);
router.get("/branch/user/:id", isAuth, isPermission, RoleCtrl.listByBranchUser);
router.post("/", isAuth, isPermission, RoleCtrl.createWithPermissions);
router.patch("/:id", isAuth, isPermission, RoleCtrl.updateRole);
router.delete("/:id", isAuth, isPermission, RoleCtrl.remove);

module.exports = router;
