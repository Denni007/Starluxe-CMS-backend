const express = require("express");
const router = express.Router();
const { isAuth, isPermission } = require("../middleware/utill.js");
const callController = require("../controller/call.js");

// --- CREATE Endpoints (POST) ---

router.post("/", isAuth, isPermission, callController.create);
router.patch("/:id", isAuth, isPermission, callController.patch);


// Maps to controller functions that hardcode the call_type: 'Log' or 'Schedule'
router.post("/log", isAuth, isPermission, callController.createLogCall);
router.post("/schedule", isAuth, isPermission, callController.createScheduleCall);

// --- UPDATE Endpoints (PATCH) ---
// Updates based on the specific action type
router.patch("/log/:id", isAuth, isPermission, callController.patchLogCall);
router.patch("/schedule/:id", isAuth, isPermission, callController.patchScheduleCall);
router.patch("/reschedule/:id", isAuth, isPermission, callController.patchRescheduleCall);
router.patch("/cancelled/:id", isAuth, isPermission, callController.patchCancelCall);

// --- READ Endpoints ---
router.get("/", isAuth, isPermission, callController.list); // Generic list (filtered by query.branch_id)
router.get("/:id", isAuth, isPermission, callController.getById); // Get single call by ID
router.get("/user/:id", isAuth, isPermission, callController.listByUser); // List calls assigned to user
router.get("/branch/:id", isAuth, isPermission, callController.listByBranch); // List ALL calls for a specific branch ID

// Type-Specific List Filters (Uses query params for branch_id)
router.get("/branch/:id/log", isAuth, isPermission, callController.listByCallLog);
router.get("/branch/:id/schedule", isAuth, isPermission, callController.listByScheduleCall);
router.get("/branch/:id/reschedule", isAuth, isPermission, callController.listByRescheduleCall);
router.get("/branch/:id/cancelled", isAuth, isPermission, callController.listByCancelledCall);

// --- DELETE Operation ---
router.delete("/:id", isAuth, callController.remove);

module.exports = router;