// app/route/leads.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const ctrl = require("../controller/task.js");
const router = express.Router();


// Read
router.get("/", isAuth, ctrl.list);
router.get("/:id", isAuth, ctrl.getById);
router.get("/branch/:id", isAuth, ctrl.listByBranch);
router.get("/user/:id", isAuth, ctrl.listByUser);
router.get("/lead/:id", isAuth, ctrl.listByLead);
router.post("/", isAuth, ctrl.create);
router.patch("/:id", isAuth, ctrl.patch);
router.delete("/:id", isAuth, ctrl.remove);

module.exports = router;
