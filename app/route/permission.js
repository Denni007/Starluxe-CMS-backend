// app/routes/permission.routes.js
const express = require("express");
const PermissionCtrl = require("../controller/permission.js");

const router = express.Router();

router.get("/", PermissionCtrl.list);
router.post("/", PermissionCtrl.create);

// New: Full sync to fixed 5
router.put("/module/:module", /*...,*/ PermissionCtrl.syncFixedModule);
// New: Add/Remove specific actions
router.patch("/module/:module", /*...,*/ PermissionCtrl.patchModuleActions);
// New: Rename module
router.put("/module/:module/rename", /*...,*/ PermissionCtrl.renameModule);
// New: Change one action to another
router.patch("/module/:module/action", /*...,*/ PermissionCtrl.patchActions);

router.delete("/module/:module", /*...,*/ PermissionCtrl.removeModule);
router.delete("/module/:module/action/:action", /*...,*/ PermissionCtrl.removeAction);

module.exports = router;
