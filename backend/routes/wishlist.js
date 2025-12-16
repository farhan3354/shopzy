import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "./../controllers/wishList.js";
import { protect } from "./../middlewares/authMidddleware.js";

const router = express.Router();

router.post("/add", protect, addToWishlist);

router.delete("/remove/:productId", protect, removeFromWishlist);

router.get("/", protect, getWishlist);


export default router;
