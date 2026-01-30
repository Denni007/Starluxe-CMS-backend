const { Comment, User } = require('../models');

const mapCommentPayload = (comment) => {
    const obj = comment.toJSON();

    if (obj.author) {
        obj.author = {
            id: obj.author.id,
            user_name: obj.author.user_name,
            email: obj.author.email,
        };
    }
    delete obj.authorId;

    return obj;
};

exports.list = async (req, res) => {
    try {
        const { todoId } = req.params;
        const items = await Comment.findAll({
            where: { todoId, isDelete: false },
            include: [{ model: User, as: 'author' }],
            order: [['created_at', 'ASC']],
        });
        const mapped = (items || []).map(mapCommentPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Comment list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { commentId } = req.params;
        const item = await Comment.findByPk(commentId, {
            include: [{ model: User, as: 'author' }],
        });

        if (!item || item.isDelete) {
            return res.status(404).json({ status: "false", message: "Comment not found" });
        }

        const mapped = mapCommentPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Comment getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
       
        const { content,todoId } = req.body;
        const authorId = req.user.id;

        if (!content) {
            return res.status(400).json({ status: "false", message: "content is required" });
        }

        const comment = await Comment.create({ content, authorId, todoId, updated_by: authorId });

        const result = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'author' }],
        });

        const finalPayload = mapCommentPayload(result);
        res.status(201).json({ status: "true", data: finalPayload });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patch = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findByPk(commentId);
        if (!comment || comment.isDelete) {
            return res.status(404).json({ status: "false", message: "Comment not found" });
        }

        // Optional: Uncomment to restrict updates to the comment author
        // if (comment.authorId !== userId) {
        //     return res.status(403).json({ status: "false", message: "Forbidden" });
        // }

        await comment.update({ content, updated_by: userId });

        const updatedComment = await Comment.findByPk(commentId, {
            include: [{ model: User, as: 'author' }],
        });

        const mapped = mapCommentPayload(updatedComment);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findByPk(commentId);
        if (!comment || comment.isDelete) {
            return res.status(404).json({ status: "false", message: "Comment not found" });
        }

        // Optional: Uncomment to restrict deletion to the comment author
        // if (comment.authorId !== userId) {
        //     return res.status(403).json({ status: "false", message: "Forbidden" });
        // }

        await comment.update({ isDelete: true, updated_by: userId });

        res.json({ status: "true", message: "Deleted successfully" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};