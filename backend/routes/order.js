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
  allowRoles,
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
  getVendorAnalytics,
  getVendorDetailedReport,
  getAdminDashboardOverview,
} from "../controllers/orderController.js";
import { lockCartForCheckout,unlockCart } from "../middlewares/cartLockMiddleware.js";

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

router.get(
  "/orders/vendor/analytics",
  protect,
  vendorMiddleware,
  getVendorAnalytics
);

router.get(
  "/getall-orders/vendors/report",
  protect,
  vendorMiddleware,
  getVendorDetailedReport
);

router.put(
  "/updatestatus/:id/status",
  protect,
  allowRoles("admin", "vendor"),
  updateOrderStatus
);
router.delete(
  "/delete-oder/:id",
  protect,
  allowRoles("admin", "vendor"),
  deleteOrder
);

router.get("/analytics", protect, adminMiddleware, getOrderAnalytics);
router.get("/admin/dashboard-overview", protect, adminMiddleware, getAdminDashboardOverview);
router.get("/recent", protect, adminMiddleware, getRecentOrders);


router.get("/user/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
export default router;
