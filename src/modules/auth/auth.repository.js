const User = require("../users/user.model");

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

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = new AuthRepository();
