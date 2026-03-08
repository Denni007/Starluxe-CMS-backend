const { Op } = require("sequelize");
const { ChatMessage, User, Branch } = require("../models");

/**
 * GET /chat/conversations
 * Fetches the list of active conversations for the logged-in user.
 */
exports.getConversations = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { branch_id } = req.query;

        // 1. Get all direct messages involving the user
        const directMessages = await ChatMessage.findAll({
            where: {
                [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
                branch_id: null,
                group_id: null,
                is_deleted: false,
            },
            include: [
                { model: User, as: "sender" },
                { model: User, as: "receiver" },
            ],
            order: [["created_at", "DESC"]],
        });

        // 2. Group messages by conversation partner
        const conversations = {};
        directMessages.forEach(msg => {
            const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!partner) return; // Skip if partner is missing

            if (!conversations[partner.id]) {
                conversations[partner.id] = {
                    id: `direct_${partner.id}`,
                    name: `${partner.first_name} ${partner.last_name}`,
                    type: "direct",
                    avatar: partner.avatar, // Assuming user model has avatar
                    unread_count: 0,
                    last_message: null,
                };
            }

            const conv = conversations[partner.id];
            if (!conv.last_message) {
                conv.last_message = {
                    content: msg.message,
                    timestamp: msg.created_at,
                };
            }
            if (!msg.is_read && msg.receiver_id === userId) {
                conv.unread_count += 1;
            }
        });

        // 3. Get branch group chat conversation
        if (branch_id) {
            const branchInfo = await Branch.findByPk(branch_id);
            if (branchInfo) {
                 const lastBranchMessage = await ChatMessage.findOne({
                    where: { branch_id, receiver_id: null, is_deleted: false },
                    order: [["created_at", "DESC"]],
                });
                const unreadBranchMessages = await ChatMessage.count({
                    where: {
                        branch_id,
                        receiver_id: null,
                        is_read: false, 
                        is_deleted: false,
                    },
                });

                conversations[`branch_${branch_id}`] = {
                    id: `branch_${branch_id}`,
                    name: `${branchInfo.name} Group`,
                    type: "branch",
                    unread_count: unreadBranchMessages,
                    last_message: lastBranchMessage ?
                        {
                            content: lastBranchMessage.message,
                            timestamp: lastBranchMessage.created_at,
                        } :
                        null,
                };
            }
        }
        
        // 4. Get internal group chat conversation
        const lastInternalGroupMessage = await ChatMessage.findOne({
            where: { group_id: "internal", receiver_id: null, is_deleted: false },
            order: [["created_at", "DESC"]],
        });
        const unreadInternalGroupMessages = await ChatMessage.count({
            where: {
                group_id: "internal",
                receiver_id: null,
                is_read: false,
                is_deleted: false,
            },
        });

        conversations['group_internal'] = {
            id: 'group_internal',
            name: 'Internal Group',
            type: 'group',
            unread_count: unreadInternalGroupMessages,
            last_message: lastInternalGroupMessage ?
                {
                    content: lastInternalGroupMessage.message,
                    timestamp: lastInternalGroupMessage.created_at,
                } :
                null,
        };

        res.json({ status: "true", data: Object.values(conversations) });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

/**
 * GET /chat/messages
 * Fetches the message history for a specific chat.
 */
exports.getMessages = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { receiver_id, branch_id, group_id } = req.query;

        let messages;
        const findOptions = {
            include: [{ model: User, as: "sender", attributes: ["id", "first_name", "last_name"] }],
            order: [["created_at", "ASC"]],
            where: { is_deleted: false },
        };

        if (receiver_id) {
            findOptions.where[Op.or] = [
                { sender_id: userId, receiver_id: receiver_id },
                { sender_id: receiver_id, receiver_id: userId },
            ];
            findOptions.where.branch_id = null;
            findOptions.where.group_id = null;
        } else if (branch_id) {
            findOptions.where.branch_id = branch_id;
            findOptions.where.receiver_id = null;
        } else if (group_id) {
            findOptions.where.group_id = group_id;
            findOptions.where.receiver_id = null;
        } else {
            return res.status(400).json({ status: "false", message: "A receiver_id, branch_id, or group_id is required." });
        }

        messages = await ChatMessage.findAll(findOptions);
        res.json({ status: "true", data: messages });

    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

/**
 * POST /chat/messages
 * Sends a new message.
 */
exports.sendMessage = async (req, res) => {
    try {
        const { id: sender_id } = req.user;
        const { content, receiver_id, branch_id, group_id, type = "text" } = req.body;
        
        if (!content) {
            return res.status(400).json({ status: "false", message: "Message content cannot be empty." });
        }
        if (!receiver_id && !branch_id && !group_id) {
             return res.status(400).json({ status: "false", message: "A receiver_id, branch_id, or group_id is required." });
        }

        const messageData = {
            sender_id,
            message: content,
            type,
            receiver_id: receiver_id ? Number(receiver_id) : null,
            branch_id: branch_id ? Number(branch_id) : null,
            group_id: group_id ? group_id : null,
        };

        const newMessage = await ChatMessage.create(messageData);

        const fullMessage = await ChatMessage.findByPk(newMessage.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name'] }]
        });

        const io = req.app.get("socketio");
        if (receiver_id) {
            io.to(`user_${receiver_id}`).emit("message:new", fullMessage);
            io.to(`user_${sender_id}`).emit("message:new", fullMessage);
        } else if (branch_id) {
            io.to(`branch_${branch_id}`).emit("message:new", fullMessage);
        } else if (group_id) {
            io.to(`group_${group_id}`).emit("message:new", fullMessage);
        }

        res.status(201).json({ status: "true", data: fullMessage });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

/**
 * PATCH /chat/messages/read
 * Marks messages as read.
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { sender_id, branch_id, group_id } = req.body;

        if (sender_id) { 
            await ChatMessage.update(
                { is_read: true },
                { where: { sender_id: Number(sender_id), receiver_id: userId, is_read: false } }
            );
        } else if (branch_id) {
            // Placeholder for group read status
        } else if (group_id) {
            // Placeholder for group read status
        } else {
            return res.status(400).json({ status: "false", message: "A sender_id, branch_id, or group_id is required." });
        }

        res.json({ status: "true", message: "Messages marked as read." });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

/**
 * PATCH /chat/messages/:messageId
 * Updates a message.
 */
exports.updateMessage = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { messageId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ status: "false", message: "Message content cannot be empty." });
        }

        const message = await ChatMessage.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ status: "false", message: "Message not found." });
        }
        if (message.sender_id !== userId) {
            return res.status(403).json({ status: "false", message: "You are not authorized to edit this message." });
        }

        message.message = content;
        await message.save();

        const io = req.app.get("socketio");
        if (message.receiver_id) {
            io.to(`user_${message.receiver_id}`).emit("message:updated", message);
            io.to(`user_${message.sender_id}`).emit("message:updated", message);
        } else if (message.branch_id) {
            io.to(`branch_${message.branch_id}`).emit("message:updated", message);
        } else if (message.group_id) {
            io.to(`group_${message.group_id}`).emit("message:updated", message);
        }

        res.json({ status: "true", data: message });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

/**
 * DELETE /chat/messages/:messageId
 * Deletes a message.
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { messageId } = req.params;

        const message = await ChatMessage.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ status: "false", message: "Message not found." });
        }
        if (message.sender_id !== userId) {
            return res.status(403).json({ status: "false", message: "You are not authorized to delete this message." });
        }

        message.is_deleted = true;
        await message.save();

        const io = req.app.get("socketio");
         if (message.receiver_id) {
            io.to(`user_${message.receiver_id}`).emit("message:deleted", { id: message.id });
            io.to(`user_${message.sender_id}`).emit("message:deleted", { id: message.id });
        } else if (message.branch_id) {
            io.to(`branch_${message.branch_id}`).emit("message:deleted", { id: message.id });
        } else if (message.group_id) {
            io.to(`group_${message.group_id}`).emit("message:deleted", { id: message.id });
        }

        res.json({ status: "true", message: "Message deleted successfully." });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};
