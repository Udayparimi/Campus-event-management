import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import myRegistrationRoutes from "./routes/myRegistrationRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change_this_secret_key") {
  throw new Error("Set JWT_SECRET to a private random signing key before starting the API.");
}
if (process.env.ADMIN_INVITE_CODE === "change_this_admin_code") {
  throw new Error("Replace the example admin invite code or leave it blank to disable admin signup.");
}
await connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/myregistrations", myRegistrationRoutes);
app.use("/api/verify", verifyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
