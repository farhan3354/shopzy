import express from "express";
import {
  createAttribute,
  deleteAttribute,
  getAttributes,
  updateAttribute,
} from "../controllers/attributesController.js";

const router = express.Router();

router.post("/", createAttribute);
router.get("/", getAttributes);
router.put("/:id", updateAttribute);
router.delete("/:id", deleteAttribute);

export default router;
