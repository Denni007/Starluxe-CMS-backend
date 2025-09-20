// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch");
const { isAuth, isPermission } = require("../middleware/utill");
const router = express.Router();

router.get("/", isAuth, isPermission, BranchCtrl.list);
router.get("/:id", isAuth, isPermission, BranchCtrl.get);
router.get("/business/:id", isPermission, BranchCtrl.listByBusiness);
router.post("/", isAuth, isPermission, BranchCtrl.create);
router.patch("/:id", isAuth, isPermission, BranchCtrl.update);
router.delete("/:id", isAuth, isPermission, BranchCtrl.remove);

module.exports = router;
