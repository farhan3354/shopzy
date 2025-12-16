import express from "express";
import {
  contactform,
  deleteMessage,
  getcontactMessage,
} from "../controllers/conatctController.js";
import { adminMiddleware, protect } from "../middlewares/authMidddleware.js";

const router = express.Router();

router.post("/contact", contactform);
router.get(
  "/admin/contact-messages",
  protect,
  adminMiddleware,
  getcontactMessage
);

router.delete(
  "/admin/contact-messages/:id",
  protect,
  adminMiddleware,
  deleteMessage
);
export default router;
