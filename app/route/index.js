const { Router } = require("express");

const router = Router();

// Auth & Users
router.use("/auth", require("./auth"));

// Core entities
router.use("/industry", require("./industry"));
router.use("/business", require("./business"));
router.use("/branch", require("./branch"));
router.use("/role", require("./role"));
router.use("/permission", require("./permission"));
router.use("/role-permissions", require("./RolePermission"));

// You can add more modules as you build them
// router.use("/leads", require("./lead.routes"));
// router.use("/tasks", require("./task.routes"));
// router.use("/activities", require("./activity.routes"));

module.exports = router;
