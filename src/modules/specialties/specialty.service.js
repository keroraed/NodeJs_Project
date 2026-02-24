const specialtyRepository = require("./specialty.repository");
const DoctorProfile = require("../doctors/doctor.model");
const ApiError = require("../../core/errors/ApiError");

class SpecialtyService {
  async createSpecialty(data) {
    const existing = await specialtyRepository.findByName(data.name);
    if (existing) {
      throw ApiError.conflict("Specialty already exists");
    }
    return specialtyRepository.create(data);
  }

  async getAllSpecialties() {
    return specialtyRepository.findAll();
  }

  async updateSpecialty(id, data) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw ApiError.notFound("Specialty not found");
    }
    if (data.name) {
      const existing = await specialtyRepository.findByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw ApiError.conflict("Specialty name already exists");
      }
    }
    return specialtyRepository.updateById(id, data);
  }

  async deleteSpecialty(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw ApiError.notFound("Specialty not found");
    }

    const doctorCount = await DoctorProfile.countDocuments({ specialty: id });
    if (doctorCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete specialty. ${doctorCount} doctor(s) are assigned to it.`,
      );
    }

    await specialtyRepository.deleteById(id);
    return { message: "Specialty deleted successfully" };
  }
}

module.exports = new SpecialtyService();
