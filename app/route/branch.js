// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch.js");

const router = express.Router();

// Standard CRUD
router.get("/branches", BranchCtrl.list);
router.get("/branches/:id", BranchCtrl.get);
router.post("/branches", BranchCtrl.create);
router.put("/branches/:id", BranchCtrl.update);
router.delete("/branches/:id", BranchCtrl.remove);

// Nested under Business
router.get("/businesses/:businessId/branches", BranchCtrl.listForBusiness);
router.post("/businesses/:businessId/branches", BranchCtrl.createForBusiness);

module.exports = router;
