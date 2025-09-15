// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const ReminderCtrl = require("../controller/reminder.js");

const router = express.Router();

router.post("/", isAuth, ReminderCtrl.create);
router.get("/", isAuth, ReminderCtrl.list);
router.get("/:id", isAuth, ReminderCtrl.getById);
router.patch("/:id", isAuth, ReminderCtrl.patch);
router.delete("/:id", isAuth, ReminderCtrl.remove);

module.exports = router;
