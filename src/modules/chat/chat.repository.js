import Conversation from "./conversation.model.js";
import Message from "./message.model.js";

class ChatRepository {
  // ── Conversation ──

  async findConversation(doctorId, patientId) {
    return Conversation.findOne({ doctor: doctorId, patient: patientId });
  }

  async findConversationById(id) {
    return Conversation.findById(id)
      .populate({
        path: "doctor",
        select: "user specialty profilePicture",
        populate: [
          { path: "user", select: "name email" },
          { path: "specialty", select: "name" },
        ],
      })
      .populate({
        path: "patient",
        select: "user",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "lastMessage",
        select: "content sender senderRole createdAt isRead",
        populate: { path: "sender", select: "name email role" },
      });
  }

  async createConversation(doctorId, patientId) {
    return Conversation.create({ doctor: doctorId, patient: patientId });
  }

  async hardDeleteConversation(conversationId) {
    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);
  }

  async getConversationsForDoctor(doctorProfileId, { skip, limit }, userId) {
    const [conversations, total] = await Promise.all([
      Conversation.find({ doctor: doctorProfileId })
        .populate({
          path: "doctor",
          select: "user specialty profilePicture",
          populate: [
            { path: "user", select: "name email" },
            { path: "specialty", select: "name" },
          ],
        })
        .populate({
          path: "patient",
          select: "user",
          populate: { path: "user", select: "name email" },
        })
        .populate({
          path: "lastMessage",
          select: "content sender senderRole createdAt isRead",
          populate: { path: "sender", select: "name email role" },
        })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ doctor: doctorProfileId }),
    ]);
    return { conversations, total };
  }

  async getConversationsForPatient(patientProfileId, { skip, limit }, userId) {
    const [conversations, total] = await Promise.all([
      Conversation.find({ patient: patientProfileId })
        .populate({
          path: "doctor",
          select: "user specialty profilePicture",
          populate: [
            { path: "user", select: "name email" },
            { path: "specialty", select: "name" },
          ],
        })
        .populate({
          path: "patient",
          select: "user",
          populate: { path: "user", select: "name email" },
        })
        .populate({
          path: "lastMessage",
          select: "content sender senderRole createdAt isRead",
          populate: { path: "sender", select: "name email role" },
        })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ patient: patientProfileId }),
    ]);
    return { conversations, total };
  }

  async updateLastMessage(conversationId, messageId) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageId, lastMessageAt: new Date() },
      { new: true },
    );
  }

  // ── Messages ──

  async createMessage(data) {
    return Message.create(data);
  }

  async getMessages(conversationId, { skip, limit }) {
    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate("sender", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: conversationId }),
    ]);
    return { messages: messages.reverse(), total };
  }

  async markMessagesAsRead(conversationId, userId) {
    return Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(conversationId, userId) {
    return Message.countDocuments({
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false,
    });
  }

  async getTotalUnreadForUser(userId, conversationIds) {
    return Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      isRead: false,
    });
  }
}

export default new ChatRepository();
