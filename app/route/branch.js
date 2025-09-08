// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch");
const router = express.Router();

// Standard CRUD
router.get("/", BranchCtrl.list);
router.get("/:id", BranchCtrl.get);
router.post("/", BranchCtrl.create);
router.put("/:id", BranchCtrl.update);
router.delete("/:id", BranchCtrl.remove);

// Nested under Business
router.get("/:businessId/branches", BranchCtrl.listForBusiness);
router.post("/:businessId/branches", BranchCtrl.createForBusiness);

module.exports = router;
