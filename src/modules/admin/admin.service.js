import User from "../users/user.model.js";
import DoctorProfile from "../doctors/doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import specialtyService from "../specialties/specialty.service.js";
import ApiError from "../../core/errors/ApiError.js";
import {
  getPagination,
  paginatedResponse,
} from "../../core/utils/pagination.util.js";

class AdminService {

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


  async approveDoctor(doctorProfileId) {
    const doctor = await DoctorProfile.findById(doctorProfileId).populate("user");
    if (!doctor) {
      throw ApiError.notFound("Doctor profile not found");
    }
    if (doctor.isApproved) {
      throw ApiError.badRequest("Doctor is already approved");
    }
    doctor.isApproved = true;
    await doctor.save();

    // Mark the user as verified so the doctor can log in
    await User.findByIdAndUpdate(doctor.user._id, { isVerified: true });

    return await DoctorProfile.findById(doctorProfileId)
      .populate("user", "name email")
      .populate("specialty", "name");
  }


  async blockUnblockUser(userId, requestingUserId) {
    if (userId === requestingUserId.toString()) {
      throw ApiError.badRequest("You cannot block/unblock yourself");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }


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


  async createSpecialty(data) {
    return specialtyService.createSpecialty(data);
  }


  async listSpecialties() {
    return specialtyService.getAllSpecialties();
  }


  async updateSpecialty(id, data) {
    return specialtyService.updateSpecialty(id, data);
  }


  async deleteSpecialty(id) {
    return specialtyService.deleteSpecialty(id);
  }
}

export default new AdminService();
