// app/routes/business.routes.js
const express = require("express");
const BusinessCtrl = require("../controller/business.js");
const { isAuth, isPermission } = require("../middleware/utill.js");
const customerTypeRouter = require("./BusinessCustomerType");

const router = express.Router();

// Nested CustomerType routes
router.use("/:businessId/customer-types", customerTypeRouter);

// CRUD for businesses
router.get("/", isAuth, isPermission, BusinessCtrl.list);
router.get("/:id", isAuth, isPermission, BusinessCtrl.get);
router.post("/", isAuth, isPermission, BusinessCtrl.create);
router.post("/business-branch", isAuth, isPermission, BusinessCtrl.createBusinessWithBranch);
router.patch("/:id", isAuth, isPermission, BusinessCtrl.update);
router.delete("/:id", isAuth, isPermission, BusinessCtrl.remove);

module.exports = router;
