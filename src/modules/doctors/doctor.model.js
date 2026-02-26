import mongoose from "mongoose";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS,
      required: true,
    },
    slots: [slotSchema],
  },
  { _id: false },
);

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    availability: [availabilitySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

doctorProfileSchema.index({ specialty: 1 });

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);

export default DoctorProfile;
