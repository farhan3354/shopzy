import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  statusChange,
  getVendorProducts,
  getcategoryProduct,
} from "../controllers/productController.js";
// import { upload } from "../config/s3Config.js";
import { upload } from "./../middlewares/multermiddleware.js";
import {
  adminMiddleware,
  allowRoles,
  protect,
} from "./../middlewares/authMidddleware.js";

const router = express.Router();

router.post(
  "/",
  upload.array("files", 5),
  protect,
  allowRoles("admin", "vendor"),
  createProduct
);

router.get("/", getProducts);

router.get("/vendor", protect, getVendorProducts);

router.get("/:id", getProductById);

router.get("/category/:id", getcategoryProduct);

router.put(
  "/:id",
  upload.array("files", 5),
  protect,
  allowRoles("admin", "vendor"),
  updateProduct
);

router.delete("/:id", protect, allowRoles("admin", "vendor"), deleteProduct);

router.put(
  "/changestatus/:id",
  protect,
  allowRoles("admin", "vendor"),
  statusChange
);

export default router;
