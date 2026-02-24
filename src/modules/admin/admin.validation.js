const Joi = require("joi");

const objectIdSchema = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ "string.pattern.base": "Invalid ID" }),
  }),
};

const createSpecialtySchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "any.required": "Specialty name is required",
    }),
  }),
};

const updateSpecialtySchema = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ "string.pattern.base": "Invalid specialty ID" }),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "any.required": "Specialty name is required",
    }),
  }),
};

module.exports = {
  objectIdSchema,
  createSpecialtySchema,
  updateSpecialtySchema,
};
