import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getLatestCategories,
} from "../controllers/categoryController.js";
import { uploadbanner } from "../config/s3Config.js";

// import { upload } from "../middlewares/multermiddleware.js";

const router = express.Router();

// Create category with image upload
router.post("/", uploadbanner.single("image"), createCategory);

// Get all categories
router.get("/", getCategories);
router.get("/latest", getLatestCategories);

// Get single category
router.get("/:id", getCategoryById);

// Update category with optional image upload
router.put("/:id", uploadbanner.single("image"), updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;

// import express from "express";
// import {
//   createCategory,
//   getCategories,
//   getCategoryById,
//   updateCategory,
//   deleteCategory,
// } from "../controllers/categoryController.js";

// const router = express.Router();

// router.post("/", createCategory); // Create category
// router.get("/", getCategories); // Get all categories
// router.get("/:id", getCategoryById); // Get single category
// router.put("/:id", updateCategory); // Update category
// router.delete("/:id", deleteCategory); // Delete category

// export default router;
