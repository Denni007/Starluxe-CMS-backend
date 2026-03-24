const express = require("express");
const router = express.Router();
const costingCtrl = require("../controller/costing");
const { isAuth } = require("../middleware/utill");

// Endpoint: POST /api/costing/settings/:lineId
router.post("/settings/:lineId", isAuth, costingCtrl.updateSettings);
router.get("/settings/:lineId", isAuth, costingCtrl.getSettings);


module.exports = router;
