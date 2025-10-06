// app/routes/industry.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const ProductsCtrl = require("../controller/product.js");

const router = express.Router();

router.post("/", isAuth, ProductsCtrl.create);
router.get("/", isAuth, ProductsCtrl.list);
router.get("/:id", isAuth, ProductsCtrl.get);
router.get("/business/:id", isAuth, ProductsCtrl.listByBusiness);

router.patch("/:id", isAuth, ProductsCtrl.update);
router.delete("/:id", isAuth, ProductsCtrl.remove);

module.exports = router;
