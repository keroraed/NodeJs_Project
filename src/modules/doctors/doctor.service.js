import doctorRepository from "./doctor.repository.js";
import appointmentRepository from "../appointments/appointment.repository.js";
import ApiError from "../../core/errors/ApiError.js";
import { VALID_STATUS_TRANSITIONS } from "../../core/config/constants.js";
import {
  getPagination,
  paginatedResponse,
} from "../../core/utils/pagination.util.js";

class DoctorService {
  /**
   * GET /api/doctors/profile — Doctor gets own profile
   */
  async getOwnProfile(userId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }
    return doctor;
  }

  /**
   * PUT /api/doctors/profile — Update profile / availability
   */
  async updateProfile(userId, updateData) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }
    return doctorRepository.updateByUserId(userId, updateData);
  }

  /**
   * GET /api/doctors/appointments — List own appointments
   */
  async getOwnAppointments(userId, query) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }

    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) {
      filter.status = query.status;
    }

    const { appointments, total } = await appointmentRepository.findByDoctor(
      doctor._id,
      filter,
      skip,
      limit,
    );

    return paginatedResponse(appointments, total, page, limit);
  }

  /**
   * PATCH /api/doctors/appointments/:id — Confirm/reject + add notes
   */
  async updateAppointment(userId, appointmentId, updateData) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }

    const appointment = await appointmentRepository.findOneByIdAndDoctor(
      appointmentId,
      doctor._id,
    );
    if (!appointment) {
      throw ApiError.notFound("Appointment not found");
    }

    if (updateData.status) {
      const allowedTransitions = VALID_STATUS_TRANSITIONS[appointment.status];
      if (
        !allowedTransitions ||
        !allowedTransitions.includes(updateData.status)
      ) {
        throw ApiError.badRequest(
          `Cannot transition from '${appointment.status}' to '${updateData.status}'`,
        );
      }
      appointment.status = updateData.status;
    }
    if (updateData.notes !== undefined) {
      appointment.notes = updateData.notes;
    }

    await appointment.save();
    return appointment;
  }

  /**
   * GET /api/doctors — List approved doctors (public)
   */
  async listApprovedDoctors(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.specialty) {
      filter.specialty = query.specialty;
    }
    const { doctors, total } = await doctorRepository.findAllApproved(
      filter,
      skip,
      limit,
    );
    return paginatedResponse(doctors, total, page, limit);
  }

  /**
   * GET /api/doctors — List all doctors (admin sees all)
   */
  async listAllDoctors(query) {
    const { page, limit, skip } = getPagination(query);
    const { doctors, total } = await doctorRepository.findAll({}, skip, limit);
    return paginatedResponse(doctors, total, page, limit);
  }

  /**
   * GET /api/doctors/:id — Get single doctor profile (public)
   */
  async getDoctorById(doctorId) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw ApiError.notFound("Doctor not found");
    }
    return doctor;
  }

  /**
   * GET /api/doctors/:id/availability — Get doctor's available slots
   */
  async getDoctorAvailability(doctorId) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw ApiError.notFound("Doctor not found");
    }
    return doctor.availability;
  }
}

export default new DoctorService();
