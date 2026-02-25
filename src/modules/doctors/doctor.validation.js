import Joi from "joi";
import { APPOINTMENT_STATUS } from "../../core/config/constants.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const updateDoctorProfileSchema = {
  body: Joi.object({
    specialty: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({ "string.pattern.base": "Invalid specialty ID" }),
    bio: Joi.string().trim().max(1000),
    availability: Joi.array().items(
      Joi.object({
        day: Joi.string()
          .valid(...DAYS)
          .required(),
        slots: Joi.array()
          .items(
            Joi.object({
              startTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
              endTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
            }),
          )
          .required(),
      }),
    ),
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
    status: Joi.string().valid(
      APPOINTMENT_STATUS.CONFIRMED,
      APPOINTMENT_STATUS.CANCELLED,
      APPOINTMENT_STATUS.COMPLETED,
    ),
    notes: Joi.string().trim().max(2000),
  }).min(1),
};

const getDoctorByIdSchema = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ "string.pattern.base": "Invalid doctor ID" }),
  }),
};

export {
  updateDoctorProfileSchema,
  updateAppointmentSchema,
  getDoctorByIdSchema,
};
