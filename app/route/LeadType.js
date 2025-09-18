// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const LeadTypeCtrl = require("../controller/LeadType.js");

const router = express.Router();

router.post("/", LeadTypeCtrl.create);
router.get("/", LeadTypeCtrl.list);
router.get("/:id", LeadTypeCtrl.get);
router.patch("/:id", LeadTypeCtrl.update);
router.delete("/:id", LeadTypeCtrl.remove);

module.exports = router;
