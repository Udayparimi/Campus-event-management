import express from "express";
import { verifyTicket, checkInByTicket } from "../controllers/registrationController.js";
import { protect, authorize } from "../middleware/auth.js";

// Admin-only endpoints used by the "Verify Pass" screen at the venue door:
// look up a QR/ticket code, then check the student in.
const router = express.Router();

router.get("/:ticketCode", protect, authorize("admin"), verifyTicket);
router.patch("/:ticketCode/checkin", protect, authorize("admin"), checkInByTicket);

export default router;
