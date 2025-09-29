// app/routes/industry.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const ProductsCtrl = require("../controller/product.js");

const router = express.Router();

router.post("/", isAuth, isPermission, ProductsCtrl.create);
router.get("/", isAuth, isPermission, ProductsCtrl.list);
router.get("/:id", isAuth, isPermission, ProductsCtrl.get);
router.patch("/:id", isAuth, isPermission, ProductsCtrl.update);
router.delete("/:id", isAuth, isPermission, ProductsCtrl.remove);

module.exports = router;
