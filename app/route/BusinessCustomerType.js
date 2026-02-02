// app/routes/BusinessCustomerType.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const CustomerTypeCtrl = require("../controller/CustomerType.js");

const router = express.Router({ mergeParams: true });

router.post("/", isAuth, CustomerTypeCtrl.create);
router.get("/", isAuth, CustomerTypeCtrl.list);

router.get("/business/:id", isAuth, CustomerTypeCtrl.listByBusiness);
router.get("/:customerTypeId", isAuth, CustomerTypeCtrl.get);
router.patch("/:customerTypeId", isAuth, CustomerTypeCtrl.update);
router.delete("/:customerTypeId", isAuth, CustomerTypeCtrl.remove);

module.exports = router;