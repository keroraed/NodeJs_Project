import DoctorProfile from "./doctor.model.js";
import User from "../users/user.model.js";

class DoctorRepository {
  async create(data) {
    const doctor = new DoctorProfile(data);
    return doctor.save();
  }

  async findByUserId(userId) {
    return DoctorProfile.findOne({ user: userId })
      .populate("user", "name email phone gender dateOfBirth address")
      .populate("specialty", "name");
  }

  async findById(id) {
    return DoctorProfile.findById(id)
      .populate("user", "name email phone gender dateOfBirth address")
      .populate("specialty", "name");
  }

  async updateByUserId(userId, updateData) {
    return DoctorProfile.findOneAndUpdate({ user: userId }, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone gender dateOfBirth address")
      .populate("specialty", "name");
  }

  async _resolveNameFilter(name) {
    if (!name) return {};
    const matchingUsers = await User.find(
      { name: { $regex: name, $options: "i" } },
      "_id",
    );
    return { user: { $in: matchingUsers.map((u) => u._id) } };
  }

  async findAllApproved(filter = {}, skip = 0, limit = 10, name = "") {
    const nameFilter = await this._resolveNameFilter(name);
    const query = { isApproved: true, ...filter, ...nameFilter };
    const [doctors, total] = await Promise.all([
      DoctorProfile.find(query)
        .populate("user", "name email phone gender")
        .populate("specialty", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      DoctorProfile.countDocuments(query),
    ]);
    return { doctors, total };
  }

  async findAll(filter = {}, skip = 0, limit = 10, name = "") {
    const nameFilter = await this._resolveNameFilter(name);
    const query = { ...filter, ...nameFilter };
    const [doctors, total] = await Promise.all([
      DoctorProfile.find(query)
        .populate("user", "name email phone gender")
        .populate("specialty", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      DoctorProfile.countDocuments(query),
    ]);
    return { doctors, total };
  }
}

export default new DoctorRepository();
