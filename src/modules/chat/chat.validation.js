import Joi from "joi";

const startConversation = {
  body: Joi.object({
    targetProfileId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "targetProfileId must be a valid MongoDB ObjectId",
        "any.required": "targetProfileId is required",
      }),
  }),
};

const sendMessage = {
  params: Joi.object({
    conversationId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "conversationId must be a valid MongoDB ObjectId",
      }),
  }),
  body: Joi.object({
    content: Joi.string().trim().min(1).max(2000).required().messages({
      "string.empty": "Message content is required",
      "string.max": "Message content cannot exceed 2000 characters",
      "any.required": "Message content is required",
    }),
  }),
};

const getMessages = {
  params: Joi.object({
    conversationId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "conversationId must be a valid MongoDB ObjectId",
      }),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const markAsRead = {
  params: Joi.object({
    conversationId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "conversationId must be a valid MongoDB ObjectId",
      }),
  }),
};

const getConversations = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const deleteConversation = {
  params: Joi.object({
    conversationId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "conversationId must be a valid MongoDB ObjectId",
      }),
  }),
};

export default {
  startConversation,
  sendMessage,
  getMessages,
  markAsRead,
  getConversations,
  deleteConversation,
};
