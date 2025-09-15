// app/routes/call.routes.js
const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/utill.js");
const callController = require("../controller/call.js");

router.get("/", isAuth ,callController.list);
router.get("/:id", isAuth ,callController.getById);
router.get("/branch/:id", isAuth ,callController.listByBranch);
router.get("/user/:id", isAuth ,callController.listByUser);
router.post("/", isAuth ,callController.create);
router.patch("/:id", isAuth ,callController.patch);
router.delete("/:id", isAuth ,callController.remove);

module.exports = router;