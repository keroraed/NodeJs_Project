const User = require("../users/user.model");
const DoctorProfile = require("../doctors/doctor.model");
const Appointment = require("../appointments/appointment.model");
const specialtyService = require("../specialties/specialty.service");
const ApiError = require("../../core/errors/ApiError");
const {
  getPagination,
  paginatedResponse,
} = require("../../core/utils/pagination.util");

class AdminService {
  /**
   * GET /api/admin/users — List all users
   */
  async listAllUsers(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.role) filter.role = query.role;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(users, total, page, limit);
  }

  /**
   * PATCH /api/admin/doctors/:id/approve — Approve a doctor
   */
  async approveDoctor(doctorProfileId) {
    const doctor = await DoctorProfile.findById(doctorProfileId);
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }
    if (doctor.isApproved) {
      throw ApiError.badRequest("Doctor is already approved");
    }
    doctor.isApproved = true;
    await doctor.save();
    return await DoctorProfile.findById(doctorProfileId)
      .populate("user", "name email")
      .populate("specialty", "name");
  }

  /**
   * PATCH /api/admin/users/:id/block — Block/unblock user (toggle isActive)
   */
  async blockUnblockUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  /**
   * GET /api/admin/appointments — View all appointments
   */
  async getAllAppointments(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .populate({
          path: "patient",
          populate: { path: "user", select: "name email" },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(filter),
    ]);

    return paginatedResponse(appointments, total, page, limit);
  }

  /**
   * POST /api/admin/specialties — Create specialty
   */
  async createSpecialty(data) {
    return specialtyService.createSpecialty(data);
  }

  /**
   * GET /api/admin/specialties — List specialties
   */
  async listSpecialties() {
    return specialtyService.getAllSpecialties();
  }

  /**
   * PUT /api/admin/specialties/:id — Update specialty
   */
  async updateSpecialty(id, data) {
    return specialtyService.updateSpecialty(id, data);
  }

  /**
   * DELETE /api/admin/specialties/:id — Delete specialty
   */
  async deleteSpecialty(id) {
    return specialtyService.deleteSpecialty(id);
  }
}

module.exports = new AdminService();
