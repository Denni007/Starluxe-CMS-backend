// app/routes/branch.routes.js
const express = require("express");
const BranchCtrl = require("../controller/branch.js");
const { isAuth } = require("../middleware/utill.js");

const router = express.Router();

// Standard CRUD
router.get("/", isAuth, BranchCtrl.list);
router.get("/:id", isAuth, BranchCtrl.get);
router.post("/", isAuth, BranchCtrl.create);
router.put("/:id", isAuth, BranchCtrl.update);
router.delete("/:id", isAuth, BranchCtrl.remove);

// Nested under Business
router.get("/:businessId/branches", isAuth, BranchCtrl.listForBusiness);
router.post("/:businessId/branches", isAuth, BranchCtrl.createForBusiness);

module.exports = router;
