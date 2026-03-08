const { Router } = require("express");
const { getConversations, getMessages, sendMessage, markAsRead, updateMessage, deleteMessage } = require("../controller/ChatController");
const { isAuth } = require("../middleware/utill"); // Corrected path and function name

const router = Router();

// Get list of active conversations
router.get("/conversations", isAuth, getConversations);

// Get message history for a specific chat
router.get("/messages", isAuth, getMessages);

// Send a new message
router.post("/messages", isAuth, sendMessage);

// Mark messages as read
router.patch("/messages/read", isAuth, markAsRead);

// Update a message
router.patch("/messages/:messageId", isAuth, updateMessage);

// Delete a message
router.delete("/messages/:messageId", isAuth, deleteMessage);

module.exports = router;
