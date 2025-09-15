// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const CallResponseStageCtrl = require("../controller/CallResponseStage.js");

const router = express.Router();

router.post("/", CallResponseStageCtrl.create);
router.get("/", CallResponseStageCtrl.list);
router.get("/:id", CallResponseStageCtrl.get);
router.put("/:id", CallResponseStageCtrl.update);
router.delete("/:id", CallResponseStageCtrl.remove);

module.exports = router;
