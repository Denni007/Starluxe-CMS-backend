// app/route/leads.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const ctrl = require("../controller/task.js");
const router = express.Router();


// Read
router.get("/", isAuth, isPermission, ctrl.list);
router.get("/:id", isAuth, isPermission, ctrl.getById);
router.get("/branch/:id", isAuth, isPermission, ctrl.listByBranch);
router.get("/user/:id", isAuth, isPermission, ctrl.listByUser);
router.get("/lead/:id", isAuth, isPermission, ctrl.listByLead);
router.post("/", isAuth, isPermission, ctrl.create);
router.patch("/:id", isAuth, isPermission, ctrl.patch);
router.delete("/:id", isAuth, isPermission, ctrl.remove);

module.exports = router;
