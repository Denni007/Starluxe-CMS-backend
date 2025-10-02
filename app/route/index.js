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
router.use("/userrolebranch", require("./UserRoleBranch"));
router.use("/permissions", require("./permission"));
router.use("/role-permissions", require("./RolePermission"));

router.use("/lead-source", require("./LeadSource"));
router.use("/lead-stage", require("./LeadStage"));
router.use("/lead-type", require("./LeadType"));
router.use("/customer-type", require("./CustomerType"));
router.use("/product-category", require("./ProductCategory"));
router.use("/products", require("./product"));
router.use("/leads", require("./lead"));
router.use("/lead-activity-log", require("./LeadActivityLog"));

router.use("/task-stage", require("./TaskStage"));
router.use("/tasks", require("./task"));

router.use("/reminders", require("./reminder"));

router.use("/call-response-stage", require("./CallResponseStage"));
router.use("/calls", require("./call"));





module.exports = router;
