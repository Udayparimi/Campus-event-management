import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateEventInput } from "../middleware/validate.js";
import registrationRouter from "./registrationRoutes.js";

const router = express.Router();

router.use("/:eventId/registrations", registrationRouter);

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, authorize("admin"), validateEventInput, createEvent);
router.put("/:id", protect, authorize("admin"), updateEvent);
router.patch("/:id/status", protect, authorize("admin"), updateEventStatus);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

export default router;
