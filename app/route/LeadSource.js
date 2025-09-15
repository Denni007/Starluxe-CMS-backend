// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill");
const LeadSourceCtrl = require("../controller/LeadSource.js");

const router = express.Router();

router.post("/", LeadSourceCtrl.create);
router.get("/", LeadSourceCtrl.list);
router.get("/:id", LeadSourceCtrl.get);
router.patch("/:id", LeadSourceCtrl.update);
router.delete("/:id", LeadSourceCtrl.remove);

module.exports = router;
