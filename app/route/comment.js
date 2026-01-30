// app/routes/comment.routes.js
const express = require("express");
const { isAuth, isPermission } = require("../middleware/utill.js");
const CommentCtrl = require("../controller/comment.js");

const router = express.Router({ mergeParams: true });

router.post("/", isAuth, isPermission, CommentCtrl.create);
router.get("/", isAuth, isPermission, CommentCtrl.list);
router.get("/:commentId", isAuth, isPermission, CommentCtrl.getById);
router.patch("/:commentId", isAuth, isPermission, CommentCtrl.patch);
router.delete("/:commentId", isAuth, isPermission, CommentCtrl.remove);

module.exports = router;
