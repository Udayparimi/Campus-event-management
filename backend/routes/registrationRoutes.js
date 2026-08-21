import express from "express";
import {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
  markAttendance,
} from "../controllers/registrationController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateRegistrationInput } from "../middleware/validate.js";

const router = express.Router({ mergeParams: true });

router.post("/", protect, validateRegistrationInput, registerForEvent);
router.delete("/", protect, cancelRegistration);
router.get("/", protect, authorize("admin"), getEventRegistrations);
router.patch("/:registrationId/attendance", protect, authorize("admin"), markAttendance);

export default router;
