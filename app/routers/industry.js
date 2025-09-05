// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const IndustryCtrl = require("../controller/industry.controller");

const router = express.Router();

router.get("/industries", IndustryCtrl.list);
router.get("/industries/:id", IndustryCtrl.get);
router.post("/industries", IndustryCtrl.create);
router.put("/industries/:id", IndustryCtrl.update);
router.delete("/industries/:id", IndustryCtrl.remove);

module.exports = router;
