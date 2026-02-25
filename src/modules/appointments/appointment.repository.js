import Appointment from "./appointment.model.js";
import { APPOINTMENT_STATUS } from "../../core/config/constants.js";
import { getDayBounds } from "../../core/utils/date.util.js";

class AppointmentRepository {
  async create(data) {
    const appointment = new Appointment(data);
    return appointment.save();
  }

  /**
   * Check if a time slot is already booked for a doctor on a given date
   */
  async findConflict(doctorId, date, startTime, endTime, excludeId = null) {
    const { startOfDay, endOfDay } = getDayBounds(date);

    const query = {
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $ne: APPOINTMENT_STATUS.CANCELLED },
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

  async findByDoctor(doctorId, filter = {}, skip = 0, limit = 10) {
    const query = { doctor: doctorId, ...filter };
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate({
          path: "patient",
          populate: { path: "user", select: "name email phone" },
        })
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 }),
      Appointment.countDocuments(query),
    ]);
    return { appointments, total };
  }

  async findOneByIdAndDoctor(appointmentId, doctorId) {
    return Appointment.findOne({ _id: appointmentId, doctor: doctorId });
  }
}

export default new AppointmentRepository();
