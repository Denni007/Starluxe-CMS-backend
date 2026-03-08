// app/route/Meeting.js
const express = require("express");
const router = express.Router();
const meetingController = require("../controller/Meeting");
const { isAuth } = require("../middleware/utill");

// Add a new meeting
router.post("/", isAuth, meetingController.addMeeting);

// Get all meetings
router.get("/", isAuth, meetingController.getMeetings);

// Update a meeting
router.put("/:id", isAuth, meetingController.updateMeeting);

// Delete a meeting
router.delete("/:id", isAuth, meetingController.deleteMeeting);

module.exports = router;
