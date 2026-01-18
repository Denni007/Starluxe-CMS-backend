const express = require("express");
const router = express.Router();

const dashboard = require("../controller/dashboard.js");
const { isAuth, isPermission, contextValidator } = require("../middleware/utill");

// BUSINESS
router.get("/:business_id/:branch_id/business/summary", isAuth, isPermission, contextValidator, dashboard.businessSummaryByBranch);
router.get("/:business_id/:branch_id/business/leads-by-source", isAuth, isPermission, contextValidator, dashboard.leadsBySource);
router.get("/:business_id/:branch_id/business/leads-by-source-status", isAuth, isPermission, contextValidator, dashboard.leadsBySourceStatus);
router.get("/:business_id/:branch_id/business/branch-comparison", isAuth, isPermission, contextValidator, dashboard.branchComparison);
router.get("/:business_id/:branch_id/business/conversion-metrics", isAuth, isPermission, contextValidator, dashboard.conversionMetrics);

// USER
router.get("/:business_id/:branch_id/user/summary", isAuth, isPermission, contextValidator, dashboard.userSummary);
router.get("/:business_id/:branch_id/user/leads-by-stage", isAuth, isPermission, contextValidator, dashboard.userLeadsByStage);
router.get("/:business_id/:branch_id/user/calls", isAuth, isPermission, contextValidator, dashboard.userCalls);
router.get("/:business_id/:branch_id/user/talk-time", isAuth, isPermission, contextValidator, dashboard.userTalkTime);

module.exports = router;