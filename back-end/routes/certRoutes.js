// routes/certRoutes.js
import express from "express";
import { registerCertificate, verifyCertificate } from "../blockchain/blockchain.js";

const router = express.Router();

// Register certificate
router.post("/register", async (req, res) => {
  const { studentId, cid } = req.body;
  try {
    const txHash = await registerCertificate(studentId, cid);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify certificate
router.get("/verify/:studentId", async (req, res) => {
  try {
    const cert = await verifyCertificate(req.params.studentId);
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Make sure to export default for ES modules
export default router;
