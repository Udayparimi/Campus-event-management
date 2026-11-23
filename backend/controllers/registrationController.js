import Registration, { SEAT_OCCUPYING_STATUSES } from "../models/Registration.js";
import Event from "../models/Event.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import generateTicketCode from "../utils/generateTicketCode.js";

const createUniqueTicketCode = async () => {
  // Extremely low collision odds (48 random bits), but loop just in case.
  let code = generateTicketCode();
  // eslint-disable-next-line no-await-in-loop
  while (await Registration.exists({ ticketCode: code })) {
    code = generateTicketCode();
  }
  return code;
};

// Standard Luhn check — catches typos/garbage without needing a real
// card network to validate against.
const passesLuhnCheck = (cardNumber) => {
  const digits = cardNumber.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// This project has no live payment provider wired up, so paid
// registrations run through this local mock gateway instead: it validates
// the card fields are well-formed (Luhn check, non-expired MM/YY, CVV
// shape) and "authorizes" the charge without contacting any real network
// or moving real money. Swap this out for a real gateway's server-side
// charge/confirm call before taking this to production.
const processMockPayment = (payment = {}) => {
  const cardName = (payment.cardName || "").trim();
  const cardNumber = (payment.cardNumber || "").trim();
  const expiry = (payment.expiry || "").trim();
  const cvv = (payment.cvv || "").trim();

  if (!cardName) return { ok: false, message: "Cardholder name is required" };
  if (!passesLuhnCheck(cardNumber)) return { ok: false, message: "That card number doesn't look valid" };

  const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!expiryMatch) return { ok: false, message: "Expiry must be in MM/YY format" };
  const expiryDate = new Date(2000 + Number(expiryMatch[2]), Number(expiryMatch[1]), 0, 23, 59, 59);
  if (expiryDate < new Date()) return { ok: false, message: "That card has expired" };

  if (!/^\d{3,4}$/.test(cvv)) return { ok: false, message: "CVV must be 3 or 4 digits" };

  return {
    ok: true,
    transactionId: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`,
  };
};

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { phone, studentId, notes, payment } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.status === "Cancelled" || event.status === "Completed") {
    return res.status(400).json({ success: false, message: `Cannot register, event is ${event.status.toLowerCase()}` });
  }

  const existing = await Registration.findOne({ event: eventId, user: req.user._id });
  if (existing && SEAT_OCCUPYING_STATUSES.includes(existing.status)) {
    return res.status(409).json({ success: false, message: "You are already registered for this event" });
  }

  const registeredCount = await Registration.countDocuments({
    event: eventId,
    status: { $in: SEAT_OCCUPYING_STATUSES },
  });
  if (registeredCount >= event.maxParticipants) {
    return res.status(400).json({ success: false, message: "No seats available for this event" });
  }

  // Paid events must clear the mock payment gateway before a seat is
  // ever reserved — a failed/missing charge never falls back to a free
  // registration.
  let paymentFields = {
    paymentStatus: "Not Required",
    amountPaid: 0,
    paymentId: "",
    paymentMethod: "",
  };

  if (event.isPaid) {
    const result = processMockPayment(payment);
    if (!result.ok) {
      return res.status(402).json({ success: false, message: result.message });
    }
    paymentFields = {
      paymentStatus: "Paid",
      amountPaid: event.price,
      paymentId: result.transactionId,
      paymentMethod: "Card",
    };
  }

  let registration;
  if (existing) {
    existing.status = "Registered";
    existing.phone = phone;
    existing.studentId = studentId;
    existing.notes = notes || "";
    existing.checkedInAt = null;
    Object.assign(existing, paymentFields);
    if (!existing.ticketCode) existing.ticketCode = await createUniqueTicketCode();
    registration = await existing.save();
  } else {
    registration = await Registration.create({
      event: eventId,
      user: req.user._id,
      phone,
      studentId,
      notes: notes || "",
      ticketCode: await createUniqueTicketCode(),
      ...paymentFields,
    });
  }

  res.status(201).json({ success: true, message: "Registered successfully", registration });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registration = await Registration.findOneAndUpdate(
    { event: eventId, user: req.user._id, status: "Registered" },
    { status: "Cancelled" },
    { new: true }
  );
  if (!registration) {
    return res.status(404).json({ success: false, message: "Active registration not found" });
  }

  res.status(200).json({ success: true, message: "Registration cancelled", registration });
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate("event")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: registrations.length, registrations });
});

export const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registrations = await Registration.find({ event: eventId })
    .populate("user", "name email department")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: registrations.length, registrations });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { eventId, registrationId } = req.params;
  return checkIn({ _id: registrationId, event: eventId }, res, false);
});

// Admin-facing: look up a student's digital pass by its ticket code (e.g.
// after scanning the QR code at the venue entrance) without changing
// anything yet, so staff can confirm identity first.
export const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketCode } = req.params;

  const registration = await Registration.findOne({ ticketCode })
    .populate("event")
    .populate("user", "name email department");

  if (!registration) {
    return res.status(404).json({ success: false, message: "No pass found for this ticket code" });
  }

  res.status(200).json({ success: true, registration });
});

// Admin-facing: check a student in at the door using their ticket code.
export const checkInByTicket = asyncHandler(async (req, res) => {
  return checkIn({ ticketCode: req.params.ticketCode }, res, true);
});

async function checkIn(filter, res, includeDetails) {
  const query = Registration.findOneAndUpdate(
    { ...filter, status: "Registered" },
    { status: "Attended", checkedInAt: new Date() },
    { new: true }
  );
  if (includeDetails) query.populate("event").populate("user", "name email department");
  const registration = await query;
  if (registration) return res.json({ success: true, message: "Checked in successfully", registration });

  const previous = await Registration.findOne(filter).select("status");
  if (!previous) return res.status(404).json({ success: false, message: "Registration not found" });
  if (previous.status === "Cancelled") {
    return res.status(400).json({ success: false, message: "This registration was cancelled" });
  }
  return res.status(409).json({ success: false, message: "This pass has already been checked in" });
}
