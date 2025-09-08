// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch");
const { isAuth } = require("../middleware/utill");
const router = express.Router();

// Standard CRUD
router.get("/",BranchCtrl.list);
router.get("/:id",isAuth, BranchCtrl.get);
router.post("/",isAuth, BranchCtrl.create);
router.put("/:id", isAuth,BranchCtrl.update);
router.delete("/:id",isAuth, BranchCtrl.remove);

// Nested under Business
router.get("/:businessId/branches", BranchCtrl.listForBusiness);
router.post("/:businessId/branches", BranchCtrl.createForBusiness);

module.exports = router;
