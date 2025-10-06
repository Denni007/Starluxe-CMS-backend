
const express = require("express");
const router = express.Router();

const ctrl = require("../controller/RolePermission");
const { isAuth, isPermission } = require("../middleware/utill");

// All role-permission routes require auth
router.get("/:roleId", isAuth, isPermission, ctrl.listByRole);
router.get("/:roleId/ids", isAuth, isPermission, ctrl.getIdsByRole);
router.post("/assign", isAuth, isPermission, ctrl.assign);
router.post("/revoke", isAuth, isPermission, ctrl.revoke);
router.post("/set-ids", isAuth, isPermission, ctrl.setIds);
router.post("/append-ids", isAuth, isPermission, ctrl.appendIds);
router.post("/remove-ids", isAuth, isPermission, ctrl.removeIds);

module.exports = router;
