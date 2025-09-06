// app/routes/business.routes.js
const express = require("express");
const BusinessCtrl = require("../controller/business.js");

const router = express.Router();

// CRUD for businesses
router.get("/businesses", BusinessCtrl.list);
router.post("/businesses", BusinessCtrl.create);
router.put("/businesses/:id", BusinessCtrl.update);
router.delete("/businesses/:id", BusinessCtrl.remove);

module.exports = router;
