// app/routes/todo.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const TodoCtrl = require("../controller/todo.js");
const commentRoutes = require("./comment.js");

const router = express.Router();

router.post("/", isAuth, isPermission, TodoCtrl.create);
router.get("/", isAuth, isPermission, TodoCtrl.list);
router.get("/branch/:id", isAuth, isPermission, TodoCtrl.listByBranch);
router.get("/:id", isAuth, isPermission, TodoCtrl.getById);
router.patch("/:id", isAuth, isPermission, TodoCtrl.patch);
router.delete("/:id", isAuth, isPermission, TodoCtrl.remove);

// Nested comment routes
router.use("/:todoId/comments", commentRoutes);

module.exports = router;
