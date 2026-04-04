const express = require("express");
const router = express.Router();
const rawMaterial = require("../controller/rawMaterial");
const { isAuth } = require("../middleware/utill");

// Raw Materials
router.get("/business/:businessId", isAuth, rawMaterial.getAllByBusiness);
router.post("", isAuth, rawMaterial.create);
router.patch("/:id", isAuth, rawMaterial.update);
router.delete("/:id", isAuth, rawMaterial.delete);

module.exports = router;