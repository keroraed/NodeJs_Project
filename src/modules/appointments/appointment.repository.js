const Appointment = require("./appointment.model");

class AppointmentRepository {
  async create(data) {
    const appointment = new Appointment(data);
    return appointment.save();
  }

  /**
   * Check if a time slot is already booked for a doctor on a given date
   */
  async findConflict(doctorId, date, startTime, endTime, excludeId = null) {
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime,
      endTime: endTime,
      status: { $ne: "cancelled" },
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Appointment.findOne(query);
  }

  async findById(id) {
    return Appointment.findById(id)
      .populate({
        path: "doctor",
        populate: [
          { path: "user", select: "name email" },
          { path: "specialty", select: "name" },
        ],
      })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" },
      });
  }

  async findByPatient(patientId, filter = {}, skip = 0, limit = 10) {
    const query = { patient: patientId, ...filter };
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate({
          path: "doctor",
          populate: [
            { path: "user", select: "name email" },
            { path: "specialty", select: "name" },
          ],
        })
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 }),
      Appointment.countDocuments(query),
    ]);
    return { appointments, total };
  }

  async findAll(filter = {}, skip = 0, limit = 10) {
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
        .sort({ date: -1 }),
      Appointment.countDocuments(filter),
    ]);
    return { appointments, total };
  }
}

module.exports = new AppointmentRepository();
