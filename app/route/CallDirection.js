// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const CallDirectionCtrl = require("../controller/CallDirection.js");

const router = express.Router();

router.post("/", CallDirectionCtrl.create);
router.get("/", CallDirectionCtrl.list);
router.get("/:id", CallDirectionCtrl.get);
router.put("/:id", CallDirectionCtrl.update);
router.delete("/:id", CallDirectionCtrl.remove);

module.exports = router;
