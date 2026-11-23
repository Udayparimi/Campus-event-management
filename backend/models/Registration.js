import mongoose from "mongoose";

export const SEAT_OCCUPYING_STATUSES = ["Registered", "Attended"];

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Registered", "Cancelled", "Attended"],
      default: "Registered",
    },
    // Details captured on the registration form at sign-up time, so the
    // event pass and the admin attendee list always show who is actually
    // attending, even if that differs from the account holder's profile.
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 20,
    },
    studentId: {
      type: String,
      required: [true, "Student / roll number is required"],
      trim: true,
      maxlength: 40,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    // Unique code encoded into the QR pass and used to check a student in
    // at the venue without looking up their account.
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    // Payment trail for paid events. Free events stay "Not Required".
    paymentStatus: {
      type: String,
      enum: ["Not Required", "Paid", "Refunded"],
      default: "Not Required",
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, user: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
