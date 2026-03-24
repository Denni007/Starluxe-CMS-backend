const express = require("express");
const router = express.Router();
const proformaCtrl = require("../controller/proformaInvoice");
const { isAuth } = require("../middleware/utill");

router.get("/", isAuth, proformaCtrl.getProformas);

router.post("/", isAuth, proformaCtrl.createProforma);
router.patch("/:id", isAuth, proformaCtrl.updateProforma);

router.get("/:id", isAuth, proformaCtrl.getProformaById);
router.delete("/:id", isAuth, proformaCtrl.deleteProforma);


module.exports = router;
