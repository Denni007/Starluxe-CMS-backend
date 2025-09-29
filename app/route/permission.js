// app/routes/permission.routes.js
const express = require("express");
const PermissionCtrl = require("../controller/permission.js");

const router = express.Router();

router.get("/", PermissionCtrl.list);
router.post("/", PermissionCtrl.create);
router.put("/module/:module", PermissionCtrl.syncFixedModule);
router.patch("/module/:module", PermissionCtrl.patchModuleActions);
router.put("/module/:module/rename", PermissionCtrl.renameModule);
router.patch("/module/:module/action", PermissionCtrl.patchActions);
router.delete("/module/:module", PermissionCtrl.removeModule);
router.delete("/module/:module/action/:action", PermissionCtrl.removeAction);

module.exports = router;
