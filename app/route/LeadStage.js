// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const LeadStageCtrl = require("../controller/LeadStage.js");

const router = express.Router();

router.post("/", LeadStageCtrl.create);
router.get("/", LeadStageCtrl.list);
router.get("/:id", LeadStageCtrl.get);
router.put("/:id", LeadStageCtrl.update);
router.delete("/:id", LeadStageCtrl.remove);

module.exports = router;
