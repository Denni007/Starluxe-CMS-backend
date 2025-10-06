const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const LeadActivityLog = require("../controller/LeadActivityLog.js");

const router = express.Router();

router.get("/", isAuth, LeadActivityLog.listAllActivities);
router.get("/:id", isAuth, LeadActivityLog.getLogById);
router.get("/lead/:id", isAuth, LeadActivityLog.getLeadActivities);

module.exports = router;
