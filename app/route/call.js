const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/utill.js");
const callController = require("../controller/call.js");

// --- CREATE Endpoints (POST) ---
// Maps to controller functions that hardcode the call_type: 'Log' or 'Schedule'
router.post("/log", isAuth, callController.createLogCall);
router.post("/schedule", isAuth, callController.createScheduleCall);

// --- UPDATE Endpoints (PATCH) ---
// Updates based on the specific action type
router.patch("/log/:id", isAuth, callController.patchLogCall);
router.patch("/schedule/:id", isAuth, callController.patchScheduleCall);
router.patch("/reschedule/:id", isAuth, callController.patchRescheduleCall);
router.patch("/cancelled/:id", isAuth, callController.patchCancelCall);

// --- READ Endpoints ---
router.get("/", isAuth, callController.list); // Generic list (filtered by query.branch_id)
router.get("/:id", isAuth, callController.getById); // Get single call by ID
router.get("/user/:id", isAuth, callController.listByUser); // List calls assigned to user
router.get("/branch/:id", isAuth, callController.listByBranch); // List ALL calls for a specific branch ID

// Type-Specific List Filters (Uses query params for branch_id)
router.get("/branch/:id/log", isAuth, callController.listByCallLog);
router.get("/branch/:id/schedule", isAuth, callController.listByScheduleCall);
router.get("/branch/:id/reschedule", isAuth, callController.listByRescheduleCall);
router.get("/branch/:id/cancelled", isAuth, callController.listByCancelledCall);

// --- DELETE Operation ---
router.delete("/:id", isAuth, callController.remove);

module.exports = router;