// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const TaskStageCtrl = require("../controller/TaskStage.js");

const router = express.Router();

router.post("/", TaskStageCtrl.create);
router.get("/", TaskStageCtrl.list);
router.get("/:id", TaskStageCtrl.get);
router.patch("/:id", TaskStageCtrl.update);
router.delete("/:id", TaskStageCtrl.remove);

module.exports = router;
