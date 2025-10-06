// app/routes/permission.routes.js
const express = require("express");
const PermissionCtrl = require("../controller/permission.js");
const { isAuth, isPermission } = require("../middleware/utill.js");

const router = express.Router();

router.get("/", isAuth, isPermission, PermissionCtrl.list);
router.post("/", isAuth, isPermission, PermissionCtrl.create);
router.put("/module/:module", isAuth, isPermission, PermissionCtrl.syncFixedModule);
router.patch("/module/:module", isAuth, isPermission, PermissionCtrl.patchModuleActions);
router.put("/module/:module/rename", isAuth, isPermission, PermissionCtrl.renameModule);
router.patch("/module/:module/action", isAuth, isPermission, PermissionCtrl.patchActions);
router.delete("/module/:module", isAuth, isPermission, PermissionCtrl.removeModule);
router.delete("/module/:module/action/:action", isAuth, isPermission, PermissionCtrl.removeAction);

module.exports = router;
