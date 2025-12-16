import express from "express";
import {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategoryId,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.post("/", createSubcategory); // Create subcategory
router.get("/", getSubcategories);
router.get("/category/:categoryId", getSubcategoriesByCategoryId); // Use this route
router.get("/:id", getSubcategoryById);
router.put("/:id", updateSubcategory); // Update subcategory
router.delete("/:id", deleteSubcategory); // Delete subcategory

export default router;
