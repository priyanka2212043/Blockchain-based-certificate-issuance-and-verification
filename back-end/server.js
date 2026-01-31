// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Existing routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollRoutes from "./routes/enrollRoutes.js";
// Blockchain routes
import certRoutes from "./routes/certRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Required for __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:5173",  // your frontend URL
  credentials: true
}));

// Parse JSON requests
app.use(express.json());

// ✅ Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollRoutes);

// Blockchain certificate routes
app.use("/api/certs", certRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
