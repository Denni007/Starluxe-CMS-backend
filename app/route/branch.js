// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch");
const { isAuth } = require("../middleware/utill");
const router = express.Router();

router.get("/", isAuth, BranchCtrl.list);
router.get("/:id", isAuth, BranchCtrl.get);
router.get("/business/:id", BranchCtrl.listByBusiness);
router.post("/", isAuth, BranchCtrl.create);
router.patch("/:id", isAuth, BranchCtrl.update);
router.delete("/:id", isAuth, BranchCtrl.remove);

module.exports = router;
