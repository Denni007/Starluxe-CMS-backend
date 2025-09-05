// app/routes/assignment.routes.js
const express = require("express");
const AssignmentsCtrl = require("../controller/assignments.js");

const router = express.Router();

router.post("/assignments", AssignmentsCtrl.create);
router.post("/assignments/bulk", AssignmentsCtrl.bulkCreate);
router.get("/assignments", AssignmentsCtrl.list);
router.get("/assignments/user/:userId", AssignmentsCtrl.listByUser);
router.get("/assignments/:id", AssignmentsCtrl.get);
router.put("/assignments/:id", AssignmentsCtrl.update);
router.put("/assignments/bulk", AssignmentsCtrl.bulkUpdate);
router.delete("/assignments/:id", AssignmentsCtrl.remove);
router.delete("/assignments/bulk", AssignmentsCtrl.bulkRemove);

module.exports = router;
