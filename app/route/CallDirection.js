// app/routes/industry.routes.js
const express = require("express");
const CallDirectionCtrl = require("../controller/CallDirection.js");

const router = express.Router();

router.post("/", CallDirectionCtrl.create);
router.get("/", CallDirectionCtrl.list);
router.get("/:id", CallDirectionCtrl.get);
router.patch("/:id", CallDirectionCtrl.update);
router.delete("/:id", CallDirectionCtrl.remove);

module.exports = router;
