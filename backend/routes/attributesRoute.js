import express from "express";
import {
  createAttribute,
  deleteAttribute,
  getAttributes,
} from "../controllers/attributesController.js";

const router = express.Router();

router.post("/", createAttribute);
router.get("/", getAttributes);
router.delete("/delete/:id",deleteAttribute)
export default router;
