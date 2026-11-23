import { authErrors } from "../../shared/authValidation.mjs";
const isEmpty = (val) => val === undefined || val === null || String(val).trim() === "";

function validateAuth(signup) {
  return (req, res, next) => {
    const errors = authErrors(req.body ?? {}, signup);
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Check the highlighted fields.", errors });
    }
    req.body.email = req.body.email.trim().toLowerCase();
    next();
  };
}

export const validateRegisterInput = validateAuth(true);
export const validateLoginInput = validateAuth(false);

export const validateEventInput = (req, res, next) => {
  const { eventName, eventType, resourcePerson, eventDate, venue, maxParticipants, description, isPaid, price } =
    req.body;
  const errors = {};

  if (isEmpty(eventName)) errors.eventName = "Event name is required";
  if (isEmpty(eventType)) errors.eventType = "Event type is required";
  if (isEmpty(resourcePerson)) errors.resourcePerson = "Resource person is required";
  if (isEmpty(eventDate)) errors.eventDate = "Event date is required";
  else if (isNaN(Date.parse(eventDate))) errors.eventDate = "Event date is invalid";
  if (isEmpty(venue)) errors.venue = "Venue is required";
  if (isEmpty(maxParticipants)) errors.maxParticipants = "Maximum participants is required";
  else if (isNaN(Number(maxParticipants)) || Number(maxParticipants) < 1)
    errors.maxParticipants = "Maximum participants must be a positive number";
  if (isEmpty(description)) errors.description = "Description is required";

  if (isPaid) {
    if (isEmpty(price) || isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = "Paid events need a ticket price greater than 0";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  next();
};

// Validates the event registration form (captured at the moment a student
// registers, separate from their account profile).
export const validateRegistrationInput = (req, res, next) => {
  const { phone, studentId, notes } = req.body;
  const errors = {};

  if (isEmpty(phone)) errors.phone = "Phone number is required";
  else if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) errors.phone = "Enter a valid phone number";

  if (isEmpty(studentId)) errors.studentId = "Student / roll number is required";

  if (notes && String(notes).length > 300) errors.notes = "Notes must be under 300 characters";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  next();
};
