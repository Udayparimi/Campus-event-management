import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, adminCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "Email is already registered" });
  }

  // Admin accounts are gated behind an invite code known only to the
  // events committee. Requesting "admin" without the correct code never
  // silently succeeds and never falls back to creating a student account.
  let allowedRole = "student";
  if (role === "admin") {
    const expectedCode = process.env.ADMIN_INVITE_CODE;
    const suppliedCode = (adminCode || "").trim();
    if (!expectedCode || !suppliedCode || suppliedCode !== expectedCode) {
      return res.status(403).json({
        success: false,
        message: "That admin invite code isn't valid. Ask your events committee for the current code.",
      });
    }
    allowedRole = "admin";
  }

  const user = await User.create({
    name,
    email,
    password,
    role: allowedRole,
    department: department || "",
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
