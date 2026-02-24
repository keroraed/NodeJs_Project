const appointmentRepository = require("./appointment.repository");
const doctorRepository = require("../doctors/doctor.repository");
const patientRepository = require("../patients/patient.repository");
const ApiError = require("../../core/errors/ApiError");
const { sendEmail } = require("../../core/utils/sendEmail.util");
const logger = require("../../core/logger/logger");

class AppointmentService {
  /**
   * POST /api/appointments — Patient books an appointment
   * Checks for double-booking, creates with status 'pending', sends email
   */
  async bookAppointment(userId, data) {
    // Get patient profile
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }

    // Get doctor profile
    const doctor = await doctorRepository.findById(data.doctor);
    if (!doctor) {
      throw ApiError.notFound("Doctor not found");
    }

    if (!doctor.isApproved) {
      throw ApiError.badRequest("Doctor is not approved yet");
    }

    // Normalize date to start of day for consistent storage
    const appointmentDate = new Date(data.date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Validate against doctor's availability schedule
    if (doctor.availability && doctor.availability.length > 0) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const appointmentDay = dayNames[appointmentDate.getDay()];
      const dayAvailability = doctor.availability.find(
        (a) => a.day === appointmentDay,
      );
      if (!dayAvailability) {
        throw ApiError.badRequest("Doctor is not available on this day");
      }
      const isWithinSlot = dayAvailability.slots.some(
        (slot) =>
          data.startTime >= slot.startTime && data.endTime <= slot.endTime,
      );
      if (!isWithinSlot) {
        throw ApiError.badRequest(
          "Requested time is not within doctor's available slots",
        );
      }
    }

    // Check for double booking
    const conflict = await appointmentRepository.findConflict(
      doctor._id,
      appointmentDate,
      data.startTime,
      data.endTime,
    );
    if (conflict) {
      throw ApiError.conflict("This time slot is already booked");
    }

    // Create appointment with status pending
    const appointment = await appointmentRepository.create({
      doctor: doctor._id,
      patient: patient._id,
      date: appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    // Send confirmation email to patient
    try {
      await sendEmail({
        to: patient.user.email,
        subject: "Appointment Booked - Medical Appointment System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Appointment Confirmation</h2>
            <p>Hello <strong>${patient.user.name}</strong>,</p>
            <p>Your appointment has been booked successfully.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
              <p><strong>Status:</strong> Pending</p>
            </div>
            <p>You will be notified once the doctor confirms your appointment.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Medical Appointment System</p>
          </div>
        `,
      });
    } catch (error) {
      logger.warn(
        `Failed to send appointment confirmation email: ${error.message}`,
      );
    }

    return await appointmentRepository.findById(appointment._id);
  }
}

module.exports = new AppointmentService();
