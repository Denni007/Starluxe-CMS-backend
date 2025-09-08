// app/routes/users.routes.js
const express = require("express");
const UsersCtrl = require("../controller/users.js");
const { isAuth } = require("../middleware/utill.js");
const { checkPermission } = require("../middleware/checkPermission.js");
// const adminAuth = require("../middleware/adminAuth.js");
// const { MODULES, ACTIONS } = require("../constant/permissions");

const router = express.Router();

// Create
router.post("/users", /* adminAuth(`${MODULES.User}:${ACTIONS.create}`), */ UsersCtrl.create);
router.post("/users/bulk", /* adminAuth(`${MODULES.User}:${ACTIONS.create}`), */ UsersCtrl.bulkCreate);

// Read
router.get("/", isAuth,/* adminAuth(`${MODULES.User}:${ACTIONS.view}`), */ UsersCtrl.list);
router.get("/check", /* adminAuth(`${MODULES.User}:${ACTIONS.view}`), */ UsersCtrl.check);
router.get("/:id", isAuth, UsersCtrl.get);
router.get("/me", isAuth, UsersCtrl.get);

router.get("/:id/memberships", /* adminAuth(`${MODULES.User}:${ACTIONS.view}`), */ UsersCtrl.memberships);
router.get("/:id/memberships/detailed", UsersCtrl.membershipsDetailed);

// Update
router.put("/users/:id", /* adminAuth(`${MODULES.User}:${ACTIONS.update}`), */ UsersCtrl.update);
router.put("/users/bulk", /* adminAuth(`${MODULES.User}:${ACTIONS.update}`), */ UsersCtrl.bulkUpdate);
router.post("/users/:id/password", /* adminAuth(`${MODULES.User}:${ACTIONS.update}`), */ UsersCtrl.changePassword);

// Delete
router.delete("/users/:id", /* adminAuth(`${MODULES.User}:${ACTIONS.delete}`), */ UsersCtrl.remove);
router.delete("/users/bulk", /* adminAuth(`${MODULES.User}:${ACTIONS.delete}`), */ UsersCtrl.bulkRemove);

module.exports = router;
