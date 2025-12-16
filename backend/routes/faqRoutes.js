import express from "express";
import {
  createFaq,
  getFaqs,
  updateFaq,
  deleteFaq,
} from "../controllers/faqController.js";

const router = express.Router();

router.get("/", getFaqs);

router.post("/", createFaq);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);

export default router;
