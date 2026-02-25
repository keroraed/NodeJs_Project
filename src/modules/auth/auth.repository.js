import User from "../users/user.model.js";

class AuthRepository {
  async findByEmail(email, selectFields = "") {
    return User.findOne({ email }).select(selectFields);
  }

  async findById(id, selectFields = "") {
    return User.findById(id).select(selectFields);
  }

  async findByResetToken(resetToken) {
    return User.findOne({ resetToken }).select("+resetToken +resetTokenExpiry");
  }

  async create(userData, session = null) {
    const user = new User(userData);
    return session ? user.save({ session }) : user.save();
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
}

export default new AuthRepository();
