const express = require("express");
const router = express.Router();

const {isAuth} = require("../middleware/utill");
const { checkPermission } = require("../middleware/checkPermission");
const ctrl = require("../controller/RolePermission.js");


// Add permissions to a role
router.post("/assign", isAuth, ctrl.assign);

// Remove permissions from a role
router.post("/revoke", isAuth, ctrl.revoke);

// Overwrite role's permissions via boolean matrix
router.post("/set", isAuth, ctrl.set);

// View role's permissions (grouped)
// router.get("/:roleId", isAuth, ctrl.listByRole);

module.exports = router;