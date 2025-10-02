const express = require("express");
const ProductCategoryCrtl = require("../controller/ProductCategory.js");
const { isAuth, isPermission } = require("../middleware/utill.js"); // Assuming middleware location

const router = express.Router();

router.get("/", isAuth, ProductCategoryCrtl.list);
router.get("/:id", isAuth, ProductCategoryCrtl.get);
router.get("/business/:id", isAuth, ProductCategoryCrtl.listByBusiness);

router.post("/", isAuth, ProductCategoryCrtl.create);
router.patch("/:id", isAuth, ProductCategoryCrtl.update);
router.delete("/:id", isAuth, ProductCategoryCrtl.remove);

module.exports = router;
