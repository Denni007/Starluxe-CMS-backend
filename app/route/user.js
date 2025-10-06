// app/routes/users.routes.js
const express = require("express");
const UsersCtrl = require("../controller/users.js");
const { isAuth, isAdmin } = require("../middleware/utill.js");
const { checkPermission } = require("../middleware/checkPermission.js");
// const adminAuth = require("../middleware/adminAuth.js");
// const { MODULES, ACTIONS } = require("../constant/permissions");

const router = express.Router();

// Create
router.post("/", UsersCtrl.create);
router.post("/bulk", UsersCtrl.bulkCreate);

// Read
router.get("/", isAuth, UsersCtrl.list);
router.get("/check", isAuth, UsersCtrl.check);
router.get("/:id", isAuth, UsersCtrl.get);
router.get("/me", isAuth, UsersCtrl.get);
router.get("/branch/:id", isAuth, UsersCtrl.getBranchUsers);


router.get("/:id/memberships", UsersCtrl.memberships);
router.get("/:id/memberships/detailed", UsersCtrl.membershipsDetailed);

// Update
router.put("/:id", isAuth, isAdmin, UsersCtrl.update);
router.patch("/:id", isAuth, isAdmin, UsersCtrl.patch);

router.put("/users/bulk", UsersCtrl.bulkUpdate);
router.post("/users/:id/password", UsersCtrl.changePassword);

// Delete
router.delete("/users/:id", UsersCtrl.remove);
router.delete("/users/bulk", UsersCtrl.bulkRemove);

module.exports = router;
