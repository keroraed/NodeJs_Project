import { Server } from "socket.io";
import { verifyToken } from "../security/jwt.strategy.js";
import User from "../../modules/users/user.model.js";
import chatService from "../../modules/chat/chat.service.js";
import logger from "../logger/logger.js";

// Map userId → Set<socketId>  (one user may have multiple tabs)
const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) onlineUsers.delete(userId);
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const getUserSockets = (userId) => onlineUsers.get(userId) || new Set();

/**
 * Initialise Socket.IO on the existing HTTP server.
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Authentication middleware ──
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (!user) return next(new Error("User not found"));
      if (!user.isActive) return next(new Error("Account is blocked"));

      // Attach user info to the socket
      socket.user = {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);
      next(new Error("Authentication failed"));
    }
  });

  // ── Connection handler ──
  io.on("connection", (socket) => {
    const userId = socket.user._id;
    logger.info(`Socket connected: ${userId} (${socket.user.role})`);

    addOnlineUser(userId, socket.id);

    // Join a personal room so we can emit events to this user later
    socket.join(`user:${userId}`);

    // Notify others that this user is online
    socket.broadcast.emit("user:online", { userId });

    // ── Join conversation room ──
    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${userId} joined conversation ${conversationId}`);
    });

    // ── Leave conversation room ──
    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${userId} left conversation ${conversationId}`);
    });

    // ── Send message ──
    socket.on("message:send", async ({ conversationId, content }, callback) => {
      try {
        if (!conversationId || !content || !content.trim()) {
          return callback?.({ error: "conversationId and content are required" });
        }

        const message = await chatService.sendMessage(
          userId,
          socket.user.role,
          conversationId,
          content.trim(),
        );

        // Broadcast to every OTHER socket in the conversation room (not the sender)
        socket.to(`conversation:${conversationId}`).emit("message:received", {
          message,
          conversationId,
        });

        // Also notify the other participant via their personal room
        // (in case they haven't joined the conversation room yet)
        const conversation = await chatService._getConversationParticipantUserIds(conversationId);
        if (conversation) {
          for (const participantUserId of conversation) {
            if (participantUserId !== userId) {
              io.to(`user:${participantUserId}`).emit("message:new", {
                conversationId,
                message,
              });
            }
          }
        }

        callback?.({ success: true, message });
      } catch (err) {
        logger.error(`Socket message:send error: ${err.message}`);
        callback?.({ error: err.message });
      }
    });

    // ── Typing indicators ──
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        userId,
        name: socket.user.name,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId,
        conversationId,
      });
    });

    // ── Mark as read ──
    socket.on("messages:read", async ({ conversationId }, callback) => {
      try {
        await chatService.markAsRead(userId, socket.user.role, conversationId);
        socket.to(`conversation:${conversationId}`).emit("messages:read", {
          conversationId,
          readBy: userId,
        });
        callback?.({ success: true });
      } catch (err) {
        logger.error(`Socket messages:read error: ${err.message}`);
        callback?.({ error: err.message });
      }
    });

    // ── Check online status ──
    socket.on("user:checkOnline", (targetUserId, callback) => {
      callback?.({ online: isUserOnline(targetUserId) });
    });

    // ── Disconnect ──
    socket.on("disconnect", (reason) => {
      removeOnlineUser(userId, socket.id);
      logger.info(`Socket disconnected: ${userId} (${reason})`);

      if (!isUserOnline(userId)) {
        socket.broadcast.emit("user:offline", { userId });
      }
    });
  });

  logger.info("Socket.IO initialized");
  return io;
};

export default initializeSocket;
