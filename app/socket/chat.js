const jwt = require("jsonwebtoken"); // Make sure to install jsonwebtoken

module.exports = (io) => {
  // Middleware for authenticating socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided."));
    }

    // Use the same secret key as your REST API
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token."));
      }
      socket.user = decoded; // Attach user info to the socket
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}, User ID: ${socket.user.id}`);

    // Join a room for direct messages
    socket.join(`user_${socket.user.id}`);

    // When a user wants to subscribe to branch chats
    socket.on("subscribe:branch", (branchId) => {
        // You should verify that the user is actually a member of this branch
        // For now, we'll trust the client.
        console.log(`User ${socket.user.id} subscribing to branch ${branchId}`);
        socket.join(`branch_${branchId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });

    // Optional: Typing indicators
    socket.on("typing:start", ({ conversationId, isBranch }) => {
        const targetRoom = isBranch ? `branch_${conversationId}` : `user_${conversationId}`;
        socket.to(targetRoom).emit("typing:start", { userId: socket.user.id });
    });

    socket.on("typing:stop", ({ conversationId, isBranch }) => {
        const targetRoom = isBranch ? `branch_${conversationId}` : `user_${conversationId}`;
        socket.to(targetRoom).emit("typing:stop", { userId: socket.user.id });
    });

  });
};
