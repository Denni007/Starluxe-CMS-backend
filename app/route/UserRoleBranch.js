// app/routes/assignment.routes.js
const express = require("express");
const Ctrl = require("../controller/UserBranchRole.js");

const router = express.Router();

router.post("/", Ctrl.create);
router.post("/bulk", Ctrl.bulkCreate);
router.get("", Ctrl.list);
router.get("/user/:userId", Ctrl.listByUser);
router.get("/:id", Ctrl.get);
router.put("/:id", Ctrl.update);
router.patch("/:id", Ctrl.updateRole);

router.put("/bulk", Ctrl.bulkUpdate);
router.delete("/:id", Ctrl.remove);
router.delete("/bulk", Ctrl.bulkRemove);

module.exports = router;
