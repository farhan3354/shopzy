import express from "express";
import {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, adminMiddleware } from "../middlewares/authMidddleware.js";

const router = express.Router();

router.post("/create", protect, adminMiddleware, createCoupon);
router.post("/validate", protect, validateCoupon);
router.get("/all", protect, adminMiddleware, getAllCoupons);
router.get("/active", getActiveCoupons);



// ✅ Parameterized routes LAST
router.put("/update/:id", protect, adminMiddleware, updateCoupon);
router.delete("/delete/:id", protect, adminMiddleware, deleteCoupon);



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
