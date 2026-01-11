import express from "express";
import {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  approveCashback,
  creditCashbackToWallet,
  rejectCashback,
  getAllCashbacks,
  getUserCashbacks,
} from "../controllers/couponController.js";
import { protect, adminMiddleware } from "../middlewares/authMidddleware.js";

const router = express.Router();

router.post("/create", protect, adminMiddleware, createCoupon);
router.post("/validate", protect, validateCoupon);
router.get("/all", protect, adminMiddleware, getAllCoupons);
router.get("/active", getActiveCoupons);

router.get("/cashbacks", protect, adminMiddleware, getAllCashbacks);
router.get("/cashbacks/my", protect, getUserCashbacks);
router.put(
  "/cashbacks/:cashbackId/approve",
  protect,
  adminMiddleware,
  approveCashback
);
router.put(
  "/cashbacks/:cashbackId/credit",
  protect,
  adminMiddleware,
  creditCashbackToWallet
);
router.put(
  "/cashbacks/:cashbackId/reject",
  protect,
  adminMiddleware,
  rejectCashback
);
router.put("/update/:id", protect, adminMiddleware, updateCoupon);
router.delete("/delete/:id", protect, adminMiddleware, deleteCoupon);


export default router;
