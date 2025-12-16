import express from "express";
import {
  createPage,
  listPages,
  getPageBySlug,
  updatePage,
  deletePage,
} from "../controllers/pageController.js";

const router = express.Router();

router.post("/", createPage);
router.get("/", listPages);
router.get("/:slug", getPageBySlug);
router.put("/:slug", updatePage);
router.delete("/:slug", deletePage);

export default router;
