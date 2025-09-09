const { Router } = require("express");

const router = Router();

// Auth & Users
router.use("/auth", require("./auth"));

// Core entities
router.use("/industries", require("./industry"));
router.use("/businesses", require("./business"));
router.use("/branches", require("./branch"));
router.use("/roles", require("./role"));
router.use("/users", require("./user"));
router.use("/UserRoleBranch", require("./UserRoleBranch"));

router.use("/permissions", require("./permission"));
router.use("/role-permissions", require("./RolePermission"));

// You can add more modules as you build them
// router.use("/leads", require("./lead.routes"));
// router.use("/tasks", require("./task.routes"));
// router.use("/activities", require("./activity.routes"));

module.exports = router;
