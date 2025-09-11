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

router.use("/lead-source", require("./LeadSource"));
router.use("/lead-stage", require("./LeadStage"));
router.use("/leads", require("./lead"));

router.use("/task-stage", require("./TaskStage"));
router.use("/tasks", require("./task"));




module.exports = router;
