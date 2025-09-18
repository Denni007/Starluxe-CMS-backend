// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const CustomerTypeCtrl = require("../controller/CustomerType.js");

const router = express.Router();

router.post("/", CustomerTypeCtrl.create);
router.get("/", CustomerTypeCtrl.list);
router.get("/:id", CustomerTypeCtrl.get);
router.patch("/:id", CustomerTypeCtrl.update);
router.delete("/:id", CustomerTypeCtrl.remove);

module.exports = router;
