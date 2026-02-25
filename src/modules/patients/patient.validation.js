import Joi from "joi";
import { APPOINTMENT_STATUS } from "../../core/config/constants.js";

const updatePatientProfileSchema = {
  body: Joi.object({
    medicalHistory: Joi.string().trim().max(5000),
  }).min(1),
};

const updateAppointmentSchema = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ "string.pattern.base": "Invalid appointment ID" }),
  }),
  body: Joi.object({
    status: Joi.string().valid(APPOINTMENT_STATUS.CANCELLED),
    date: Joi.date().min("now"),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).min(1),
};

export { updatePatientProfileSchema, updateAppointmentSchema };
