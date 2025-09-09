// app/routes/business.routes.js
const express = require("express");
const BusinessCtrl = require("../controller/business.js");
const { isAuth } = require("../middleware/utill.js");

const router = express.Router();

// CRUD for businesses
router.get("/", isAuth, BusinessCtrl.list);
router.get("/:id", isAuth, BusinessCtrl.get);
router.post("/", isAuth, BusinessCtrl.create);
router.post("/business-branch", isAuth, BusinessCtrl.createBusinessWithBranch);
router.patch("/:id", isAuth, BusinessCtrl.update);
router.delete("/:id", isAuth, BusinessCtrl.remove);

module.exports = router;

//  // app/route/lead.js
// const express = require("express");
// const router = express.Router();
// const {checkPermission} = require("../middleware/checkPermission");

// router.post("/", checkPermission("Leads", "create"), async (req, res) => {
//   // create lead...
//   res.json({ ok: true });
// });

// router.get("/", checkPermission("Leads", "view"), async (req, res) => {
//   // list leads...
//   res.json({ ok: true });
// });

// module.exports = router;