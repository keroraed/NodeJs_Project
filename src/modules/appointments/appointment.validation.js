const Joi = require("joi");

const bookAppointmentSchema = {
  body: Joi.object({
    doctor: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid doctor ID",
        "any.required": "Doctor ID is required",
      }),
    date: Joi.date().min("now").required().messages({
      "date.min": "Appointment date must be in the future",
      "any.required": "Date is required",
    }),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid start time format (HH:mm)",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid end time format (HH:mm)",
        "any.required": "End time is required",
      }),
  }),
};

module.exports = { bookAppointmentSchema };
