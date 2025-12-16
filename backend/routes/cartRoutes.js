import express from "express";
import { protect } from "./../middlewares/authMidddleware.js";
import {
  addToCart,
  getCart,
  getCartCh,
  removeCartItem,
  updateCartAttributes,
  updateCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/cart", protect, addToCart);

router.get("/cartproduct", protect, getCartCh);

router.get("/cartproducts", protect, getCart);

router.put("/cart/update", protect, updateCartItem);

router.put("/cart/update-attributes", protect, updateCartAttributes);

router.delete("/cart/remove", protect, removeCartItem);

export default router;
