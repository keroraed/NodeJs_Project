import chatRepository from "./chat.repository.js";
import doctorRepository from "../doctors/doctor.repository.js";
import patientRepository from "../patients/patient.repository.js";
import ApiError from "../../core/errors/ApiError.js";
import { ROLES } from "../../core/config/constants.js";

class ChatService {
  /**
   * Start or retrieve an existing conversation between a doctor and patient.
   * Either party can initiate.
   */
  async startConversation(userId, userRole, targetProfileId) {
    let doctorProfileId, patientProfileId;

    if (userRole === ROLES.DOCTOR) {
      const doctorProfile = await doctorRepository.findByUserId(userId);
      if (!doctorProfile) throw ApiError.notFound("Doctor profile not found");
      if (!doctorProfile.isApproved)
        throw ApiError.forbidden("Your doctor account is not yet approved");
      doctorProfileId = doctorProfile._id;

      const patientProfile = await patientRepository.findById(targetProfileId);
      if (!patientProfile) throw ApiError.notFound("Patient not found");
      patientProfileId = patientProfile._id;
    } else if (userRole === ROLES.PATIENT) {
      const patientProfile = await patientRepository.findByUserId(userId);
      if (!patientProfile) throw ApiError.notFound("Patient profile not found");
      patientProfileId = patientProfile._id;

      const doctorProfile = await doctorRepository.findById(targetProfileId);
      if (!doctorProfile) throw ApiError.notFound("Doctor not found");
      if (!doctorProfile.isApproved)
        throw ApiError.forbidden("This doctor is not yet approved and cannot be contacted");
      doctorProfileId = doctorProfile._id;
    } else {
      throw ApiError.forbidden("Only doctors and patients can use chat");
    }

    let conversation = await chatRepository.findConversation(
      doctorProfileId,
      patientProfileId,
    );

    if (!conversation) {
      conversation = await chatRepository.createConversation(
        doctorProfileId,
        patientProfileId,
      );
    }

    return chatRepository.findConversationById(conversation._id);
  }

  /**
   * Get all conversations for the authenticated user.
   */
  async getConversations(userId, userRole, pagination) {
    if (userRole === ROLES.DOCTOR) {
      const doctorProfile = await doctorRepository.findByUserId(userId);
      if (!doctorProfile) throw ApiError.notFound("Doctor profile not found");
      return chatRepository.getConversationsForDoctor(
        doctorProfile._id,
        pagination,
        userId,
      );
    }

    if (userRole === ROLES.PATIENT) {
      const patientProfile = await patientRepository.findByUserId(userId);
      if (!patientProfile)
        throw ApiError.notFound("Patient profile not found");
      return chatRepository.getConversationsForPatient(
        patientProfile._id,
        pagination,
        userId,
      );
    }

    throw ApiError.forbidden("Only doctors and patients can use chat");
  }

  /**
   * Soft-delete a conversation for the requesting user only.
   * The other participant still sees it normally.
   */
  async deleteConversation(userId, userRole, conversationId) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound("Conversation not found");
    await this._assertParticipant(userId, userRole, conversation);
    await chatRepository.hardDeleteConversation(conversationId);
  }

  /**
   * Send a message in a conversation.  Returns the saved message.
   */
  async sendMessage(userId, userRole, conversationId, content) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound("Conversation not found");

    // Ensure sender belongs to this conversation
    await this._assertParticipant(userId, userRole, conversation);

    const message = await chatRepository.createMessage({
      conversation: conversationId,
      sender: userId,
      senderRole: userRole,
      content,
    });

    await chatRepository.updateLastMessage(conversationId, message._id);

    const populated = await message.populate("sender", "name email role");
    return populated;
  }

  /**
   * Retrieve paginated messages for a conversation.
   */
  async getMessages(userId, userRole, conversationId, pagination) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound("Conversation not found");

    await this._assertParticipant(userId, userRole, conversation);

    // Mark messages as read
    await chatRepository.markMessagesAsRead(conversationId, userId);

    return chatRepository.getMessages(conversationId, pagination);
  }

  /**
   * Mark all messages in a conversation as read for the given user.
   */
  async markAsRead(userId, userRole, conversationId) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound("Conversation not found");

    await this._assertParticipant(userId, userRole, conversation);

    return chatRepository.markMessagesAsRead(conversationId, userId);
  }

  /**
   * Get total unread message count across all conversations.
   */
  async getUnreadCount(userId, userRole) {
    const { conversations } = await this.getConversations(
      userId,
      userRole,
      { skip: 0, limit: 1000 },
    );
    const conversationIds = conversations.map((c) => c._id);
    if (conversationIds.length === 0) return 0;
    return chatRepository.getTotalUnreadForUser(userId, conversationIds);
  }

  /**
   * Return an array of User _id strings for both participants.
   * Used by the socket layer to notify the other party.
   */
  async _getConversationParticipantUserIds(conversationId) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) return null;

    const ids = [];

    // Doctor side – populated doctor.user may be an object or id
    const docUser = conversation.doctor?.user;
    if (docUser) ids.push(String(docUser._id || docUser));

    // Patient side
    const patUser = conversation.patient?.user;
    if (patUser) ids.push(String(patUser._id || patUser));

    return ids;
  }

  // ── Private helpers ──

  async _assertParticipant(userId, userRole, conversation) {
    if (userRole === ROLES.DOCTOR) {
      const doctorProfile = await doctorRepository.findByUserId(userId);
      if (
        !doctorProfile ||
        String(conversation.doctor._id || conversation.doctor) !==
          String(doctorProfile._id)
      ) {
        throw ApiError.forbidden("You are not a participant in this conversation");
      }
    } else if (userRole === ROLES.PATIENT) {
      const patientProfile = await patientRepository.findByUserId(userId);
      if (
        !patientProfile ||
        String(conversation.patient._id || conversation.patient) !==
          String(patientProfile._id)
      ) {
        throw ApiError.forbidden("You are not a participant in this conversation");
      }
    } else {
      throw ApiError.forbidden("Only doctors and patients can use chat");
    }
  }
}

export default new ChatService();
