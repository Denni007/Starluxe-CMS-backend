// app/routes/industry.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const ReminderCtrl = require("../controller/reminder.js");

const router = express.Router();

router.post("/", isAuth, isPermission, ReminderCtrl.create);
router.get("/", isAuth, isPermission, ReminderCtrl.list);
router.get("/:id", isAuth, isPermission, ReminderCtrl.getById);
router.get("/branch/:id", isAuth, isPermission, ReminderCtrl.listByBranch);
router.patch("/:id", isAuth, isPermission, ReminderCtrl.patch);
router.delete("/:id", isAuth, isPermission, ReminderCtrl.remove);

module.exports = router;
