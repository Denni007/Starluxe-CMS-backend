const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const LeadActivityLog = require("../controller/LeadActivityLog.js");

const router = express.Router();

router.get("/", LeadActivityLog.listAllActivities);
router.get("/:id", LeadActivityLog.getLogById);
router.get("/lead/:id", LeadActivityLog.getLeadActivities);

module.exports = router;
