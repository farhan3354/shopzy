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
  rejectReferralReward,
  creditReferralReward,
  approveReferralReward,
  getAllReferrals,
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

// ✅ Parameterized routes LAST
router.put("/update/:id", protect, adminMiddleware, updateCoupon);
router.delete("/delete/:id", protect, adminMiddleware, deleteCoupon);

router.get("/admin", protect, adminMiddleware, getAllReferrals);
router.put(
  "/:referralId/orders/:orderIndex/approve",
  protect,
  adminMiddleware,
  approveReferralReward
);
router.put(
  "/:referralId/orders/:orderIndex/credit",
  protect,
  adminMiddleware,
  creditReferralReward
);
router.put(
  "/:referralId/orders/:orderIndex/reject",
  protect,
  adminMiddleware,
  rejectReferralReward
);

export default router;

// import express from "express";
// import {
//   createCoupon,
//   validateCoupon,
//   getAllCoupons,
//   getActiveCoupons,
//   updateCoupon,
//   deleteCoupon,
// } from "../controllers/couponController.js";
// import { protect, adminMiddleware } from "../middlewares/authMidddleware.js";

// const router = express.Router();

// router.post("/coupons", protect, adminMiddleware, createCoupon);
// router.get("/coupons/get", protect, adminMiddleware, getAllCoupons);

// router.patch(
//   "/coupons/status-change/:id",
//   protect,
//   adminMiddleware,
//   updateCoupon
// );
// router.delete("/coupons/:id", protect, adminMiddleware, deleteCoupon);

// // Public routes
// router.get("/active", getActiveCoupons);

// // User routes
// router.post("/coupons/validate", protect, validateCoupon);

// export default router;
