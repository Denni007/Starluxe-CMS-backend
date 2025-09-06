// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const IndustryCtrl = require("../controller/industry.js");

const router = express.Router();

router.post("/", IndustryCtrl.create);
router.get("/", IndustryCtrl.list);
router.get("/:id", IndustryCtrl.get);
router.put("/:id", IndustryCtrl.update);
router.delete("/:id", IndustryCtrl.remove);

module.exports = router;
