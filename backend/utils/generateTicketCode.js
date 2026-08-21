import crypto from "crypto";

// Produces a short, human-friendly, unique ticket code e.g. "CE-7F3K9QAB"
const generateTicketCode = () => {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `CE-${random}`;
};

export default generateTicketCode;
