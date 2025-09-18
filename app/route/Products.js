// app/routes/industry.routes.js
const express = require("express");
const { isAuth } = require("../middleware/utill.js");
const ProductsCtrl = require("../controller/Products.js");

const router = express.Router();

router.post("/", ProductsCtrl.create);
router.get("/", ProductsCtrl.list);
router.get("/:id", ProductsCtrl.get);
router.patch("/:id", ProductsCtrl.update);
router.delete("/:id", ProductsCtrl.remove);

module.exports = router;
