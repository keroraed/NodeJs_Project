import chatService from "./chat.service.js";
import { getPagination, paginatedResponse } from "../../core/utils/pagination.util.js";

class ChatController {
  async startConversation(req, res) {
    const { targetProfileId } = req.body;
    const conversation = await chatService.startConversation(
      req.user._id,
      req.user.role,
      targetProfileId,
    );
    res.status(200).json({ success: true, data: conversation });
  }

  async getConversations(req, res) {
    const { page, limit, skip } = getPagination(req.query);
    const { conversations, total } = await chatService.getConversations(
      req.user._id,
      req.user.role,
      { skip, limit },
    );
    res
      .status(200)
      .json({ success: true, ...paginatedResponse(conversations, total, page, limit) });
  }

  async sendMessage(req, res) {
    const { conversationId } = req.params;
    const { content } = req.body;
    const message = await chatService.sendMessage(
      req.user._id,
      req.user.role,
      conversationId,
      content,
    );
    res.status(201).json({ success: true, data: message });
  }

  async getMessages(req, res) {
    const { conversationId } = req.params;
    const { page, limit, skip } = getPagination(req.query);
    const { messages, total } = await chatService.getMessages(
      req.user._id,
      req.user.role,
      conversationId,
      { skip, limit },
    );
    res
      .status(200)
      .json({ success: true, ...paginatedResponse(messages, total, page, limit) });
  }

  async markAsRead(req, res) {
    const { conversationId } = req.params;
    await chatService.markAsRead(req.user._id, req.user.role, conversationId);
    res.status(200).json({ success: true, message: "Messages marked as read" });
  }

  async getUnreadCount(req, res) {
    const count = await chatService.getUnreadCount(
      req.user._id,
      req.user.role,
    );
    res.status(200).json({ success: true, data: { unreadCount: count } });
  }

  async deleteConversation(req, res) {
    const { conversationId } = req.params;
    await chatService.deleteConversation(
      req.user._id,
      req.user.role,
      conversationId,
    );
    res.status(200).json({
      success: true,
      message: "Conversation and all its messages have been permanently deleted.",
    });
  }
}

export default new ChatController();
