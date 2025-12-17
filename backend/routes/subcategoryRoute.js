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

router.post("/", createSubcategory); 
router.get("/", getSubcategories);
router.get("/category/:categoryId", getSubcategoriesByCategoryId); 
router.get("/:id", getSubcategoryById);
router.put("/:id", updateSubcategory); 
router.delete("/:id", deleteSubcategory);

export default router;
