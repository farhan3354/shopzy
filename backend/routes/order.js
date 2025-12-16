import express from "express";
import {
  razorpayWebhook,
  checkOrderStatus,
  createPaymentFromCart,
  validateCartStock,
  createCODOrder,
} from "../controllers/paymentController.js";
import {
  adminMiddleware,
  protect,
  vendorMiddleware,
} from "../middlewares/authMidddleware.js";
import {
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderAnalytics,
  getRecentOrders,
  getVendorOrders,
} from "../controllers/orderController.js";
import { lockCartForCheckout } from "../middlewares/cartLockMiddleware.js";

const router = express.Router();

router.post("/webhook", razorpayWebhook);

router.use(express.json());

router.post(
  "/cart/validate-stock",
  protect,
  lockCartForCheckout,
  validateCartStock
);
router.post(
  "/payments/create-from-cart",
  protect,
  lockCartForCheckout,
  createPaymentFromCart
);
router.post("/orders/create-cod", protect, lockCartForCheckout, createCODOrder);

router.post("/cart/unlock", protect, async (req, res) => {
  try {
    const sessionId = req.headers["x-checkout-session"];
    await unlockCart(req.user.id, sessionId);

    res.json({
      success: true,
      message: "Cart unlocked successfully",
    });
  } catch (error) {
    console.error("Cart unlock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlock cart",
    });
  }
});

router.get("/orders/status/:orderId", protect, checkOrderStatus);

// router.post("/cart/validate-stock", protect, validateCartStock);
// router.post("/payments/create-from-cart", protect, createPaymentFromCart);
// router.get("/orders/status/:orderId", protect, checkOrderStatus);

// router.post("/orders/create-cod", protect, createCODOrder);

router.get("/getall-orders", protect, adminMiddleware, getAllOrders);
router.get(
  "/getall-orders/vendors",
  protect,
  vendorMiddleware,
  getVendorOrders
);

router.put(
  "/updatestatus/:id/status",
  protect,
  adminMiddleware,
  updateOrderStatus
);
router.delete("/delete-oder/:id", protect, adminMiddleware, deleteOrder);

router.get("/analytics", protect, adminMiddleware, getOrderAnalytics);
router.get("/recent", protect, adminMiddleware, getRecentOrders);

router.get("/user/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
export default router;
