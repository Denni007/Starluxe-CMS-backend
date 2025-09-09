// const express = require("express");
// const router = express.Router();

// const {isAuth} = require("../middleware/utill");
// const { checkPermission } = require("../middleware/checkPermission");
// const ctrl = require("../controller/RolePermission.js");


// // Add permissions to a role
// router.post("/assign", isAuth, ctrl.assign);

// // Remove permissions from a role
// router.post("/revoke", isAuth, ctrl.revoke);

// // Overwrite role's permissions via boolean matrix
// router.post("/set", isAuth, ctrl.set);
// router.get("/:roleId/ids",    ctrl.getIdsByRole);
// router.post("/set-ids",      ctrl.setIds);     // overwrite to exactly match array
// router.post("/append-ids",  ctrl.appendIds);  // add only
// router.post("/remove-ids",   ctrl.removeIds);  // remove only

// // View role's permissions (grouped)
// // router.get("/:roleId", isAuth, ctrl.listByRole);

// module.exports = router;
// app/route/rolePermission.js
const express = require("express");
const router = express.Router();

const ctrl = require("../controller/RolePermission");

// All role-permission routes require auth
router.get("/:roleId", ctrl.listByRole);
router.get("/:roleId/ids", ctrl.getIdsByRole); 
router.post("/assign", ctrl.assign); 
router.post("/revoke",  ctrl.revoke); 
router.post("/set-ids",  ctrl.setIds); 
router.post("/append-ids", ctrl.appendIds); 
router.post("/remove-ids", ctrl.removeIds); 

module.exports = router;