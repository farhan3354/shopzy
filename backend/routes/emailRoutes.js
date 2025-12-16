import express from "express";
import { sendAnnouncementEmail, sendTestEmail } from "../controllers/emailController.js";
import { protect, adminMiddleware } from "../middlewares/authMidddleware.js";

const router = express.Router();

// Email campaigns
router.post('/send', protect, adminMiddleware, sendAnnouncementEmail);
router.post('/test', protect, adminMiddleware, sendTestEmail);

export default router;
