const { Router } = require("express");

const router = Router();

// Auth & Users
router.use("/auth", require("./auth"));

// Core entities
router.use("/businesses", require("./business"));
router.use("/branches", require("./branch"));
router.use("/roles", require("./role"));
router.use("/industries", require("./industry"));

// You can add more modules as you build them
// router.use("/permissions", require("./permission.routes"));
// router.use("/leads", require("./lead.routes"));
// router.use("/tasks", require("./task.routes"));
// router.use("/activities", require("./activity.routes"));

module.exports = router;
