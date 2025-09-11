// app/route/leads.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const ctrl = require("../controller/lead.js");
const router = express.Router();

// Read
router.get("/", isAuth, ctrl.list);
router.get("/:id", isAuth, ctrl.getById);
router.post("/", isAuth, ctrl.create);
router.patch("/:id", isAuth, ctrl.patch);
router.delete("/:id", isAuth, ctrl.remove);

module.exports = router;
