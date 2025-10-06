// app/routes/assignment.routes.js
const express = require("express");
const Ctrl = require("../controller/UserBranchRole.js");
const { isAuth, isPermission } = require("../middleware/utill.js");

const router = express.Router();

router.post("/", isAuth, isPermission, Ctrl.create);
router.post("/bulk", isAuth, isPermission, Ctrl.bulkCreate);
router.get("", isAuth, isPermission, Ctrl.list);
router.get("/user/:userId", isAuth, isPermission, Ctrl.listByUser);
router.get("/:id", isAuth, isPermission, Ctrl.get);
router.put("/:id", isAuth, isPermission, Ctrl.update);
router.patch("/:id", isAuth, isPermission, Ctrl.updateRole);

router.put("/bulk", isAuth, isPermission, Ctrl.bulkUpdate);
router.delete("/:id", isAuth, isPermission, Ctrl.remove);
router.delete("/bulk", isAuth, isPermission, Ctrl.bulkRemove);

module.exports = router;
