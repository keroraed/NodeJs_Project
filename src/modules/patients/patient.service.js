const patientRepository = require("./patient.repository");
const Appointment = require("../appointments/appointment.model");
const appointmentRepository = require("../appointments/appointment.repository");
const doctorRepository = require("../doctors/doctor.repository");
const ApiError = require("../../core/errors/ApiError");
const {
  APPOINTMENT_STATUS,
  VALID_STATUS_TRANSITIONS,
} = require("../../core/config/constants");
const {
  getPagination,
  paginatedResponse,
} = require("../../core/utils/pagination.util");

class PatientService {
  /**
   * GET /api/patients/profile — Get own profile
   */
  async getProfile(userId) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }
    return patient;
  }

  /**
   * PUT /api/patients/profile — Update profile
   */
  async updateProfile(userId, updateData) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }
    return patientRepository.updateByUserId(userId, updateData);
  }

  /**
   * GET /api/patients/appointments — List own appointments
   */
  async getAppointments(userId, query) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }

    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;

    const { appointments, total } = await appointmentRepository.findByPatient(
      patient._id,
      filter,
      skip,
      limit,
    );

    return paginatedResponse(appointments, total, page, limit);
  }

  /**
   * PATCH /api/patients/appointments/:id — Cancel or reschedule
   */
  async updateAppointment(userId, appointmentId, updateData) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patient._id,
    });
    if (!appointment) {
      throw ApiError.notFound("Appointment not found");
    }

    // Cancel
    if (updateData.status === APPOINTMENT_STATUS.CANCELLED) {
      const allowedTransitions = VALID_STATUS_TRANSITIONS[appointment.status];
      if (
        !allowedTransitions ||
        !allowedTransitions.includes(APPOINTMENT_STATUS.CANCELLED)
      ) {
        throw ApiError.badRequest(
          `Cannot cancel an appointment with status '${appointment.status}'`,
        );
      }
      appointment.status = APPOINTMENT_STATUS.CANCELLED;
      await appointment.save();
      return appointment;
    }

    // Reschedule
    if (updateData.date || updateData.startTime || updateData.endTime) {
      const newDate = updateData.date || appointment.date;
      const newStartTime = updateData.startTime || appointment.startTime;
      const newEndTime = updateData.endTime || appointment.endTime;

      // Validate against doctor's availability
      const doctor = await doctorRepository.findById(appointment.doctor);
      if (doctor && doctor.availability && doctor.availability.length > 0) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const appointmentDate = new Date(newDate);
        const appointmentDay = dayNames[appointmentDate.getDay()];
        const dayAvailability = doctor.availability.find(
          (a) => a.day === appointmentDay,
        );
        if (!dayAvailability) {
          throw ApiError.badRequest("Doctor is not available on this day");
        }
        const isWithinSlot = dayAvailability.slots.some(
          (slot) =>
            newStartTime >= slot.startTime && newEndTime <= slot.endTime,
        );
        if (!isWithinSlot) {
          throw ApiError.badRequest(
            "Requested time is not within doctor's available slots",
          );
        }
      }

      // Check for conflicts
      const conflict = await appointmentRepository.findConflict(
        appointment.doctor,
        newDate,
        newStartTime,
        newEndTime,
        appointment._id,
      );
      if (conflict) {
        throw ApiError.conflict("This time slot is already booked");
      }

      appointment.date = newDate;
      appointment.startTime = newStartTime;
      appointment.endTime = newEndTime;
      appointment.status = APPOINTMENT_STATUS.PENDING;
      await appointment.save();
      return appointment;
    }

    throw ApiError.badRequest("No valid update data provided");
  }
}

module.exports = new PatientService();
