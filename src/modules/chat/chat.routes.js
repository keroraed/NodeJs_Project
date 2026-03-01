import { Router } from "express";
import chatController from "./chat.controller.js";
import validate from "../../core/middlewares/validate.middleware.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import authorize from "../../core/middlewares/role.middleware.js";
import { ROLES } from "../../core/config/constants.js";
import chatValidation from "./chat.validation.js";

const router = Router();

// All chat routes require authentication and doctor/patient role
router.use(authenticate, authorize(ROLES.DOCTOR, ROLES.PATIENT));

// Start or get a conversation
router.post(
  "/conversations",
  validate(chatValidation.startConversation),
  chatController.startConversation,
);

// List conversations for the authenticated user
router.get(
  "/conversations",
  validate(chatValidation.getConversations),
  chatController.getConversations,
);

// Send a message to a conversation
router.post(
  "/conversations/:conversationId/messages",
  validate(chatValidation.sendMessage),
  chatController.sendMessage,
);

// Get messages for a conversation (paginated)
router.get(
  "/conversations/:conversationId/messages",
  validate(chatValidation.getMessages),
  chatController.getMessages,
);

// Mark all messages in a conversation as read
router.patch(
  "/conversations/:conversationId/read",
  validate(chatValidation.markAsRead),
  chatController.markAsRead,
);

// Get total unread message count
router.get("/unread-count", chatController.getUnreadCount);

// Delete a conversation for the current user only
router.delete(
  "/conversations/:conversationId",
  validate(chatValidation.deleteConversation),
  chatController.deleteConversation,
);

export default router;
