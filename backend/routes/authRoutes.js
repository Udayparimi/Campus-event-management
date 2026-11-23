import express from "express";
import { rateLimit } from "express-rate-limit";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { validateRegisterInput, validateLoginInput } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const limitAuthAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
});

router.post("/register", limitAuthAttempts, validateRegisterInput, registerUser);
router.post("/login", limitAuthAttempts, validateLoginInput, loginUser);
router.get("/me", protect, getMe);

export default router;
