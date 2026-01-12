import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.js";
import Cart from "../models/cartModel.js";
import Product from "../models/product.js";
import CouponUsage from "../models/CouponUsage.js";
import Coupon from "../models/couponModel.js";

import AuthModel from "../models/authModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export const lockCartForCheckout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId =
      req.headers["x-checkout-session"] ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (cart.isLocked && cart.lockSessionId !== sessionId) {
      const lockAge = Date.now() - new Date(cart.lockedAt).getTime();
      const lockTimeout = 15 * 60 * 1000;

      if (lockAge > lockTimeout) {
        console.log(`🔄 Auto-unlocking stale cart lock for user ${userId}`);
        cart.isLocked = false;
        cart.lockedAt = null;
        cart.lockSessionId = null;
        await cart.save();
      } else {
        return res.status(423).json({
          success: false,
          message:
            "Cart is currently being used in another checkout session. Please wait or refresh the page.",
          code: "CART_LOCKED",
        });
      }
    }

    cart.isLocked = true;
    cart.lockedAt = new Date();
    cart.lockSessionId = sessionId;
    cart.lastActivity = new Date();
    await cart.save();

    req.cartSessionId = sessionId;
    next();
  } catch (error) {
    console.error("Cart locking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to lock cart",
    });
  }
};

export const unlockCart = async (userId, sessionId = null) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (cart && cart.isLocked) {
      if (!sessionId || cart.lockSessionId === sessionId) {
        cart.isLocked = false;
        cart.lockedAt = null;
        cart.lockSessionId = null;
        await cart.save();
        console.log(`✅ Cart unlocked for user ${userId}`);
      }
    }
  } catch (error) {
    console.error("Cart unlocking error:", error);
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("🪝 Webhook received at:", new Date().toISOString());

    const razorpaySignature = req.headers["x-razorpay-signature"];
    const webhookId = req.headers["x-razorpay-event-id"];
    const eventType = req.headers["x-razorpay-event"];

    console.log("🔐 Webhook details:", {
      event: eventType,
      webhookId: webhookId || "Not provided",
      signaturePresent: !!razorpaySignature,
    });

    if (!razorpaySignature) {
      console.error("❌ BLOCKED: No signature in webhook");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook - signature required",
      });
    }

    if (!req.rawBody) {
      console.error("❌ BLOCKED: No raw body available");
      return res.status(400).json({
        success: false,
        message: "Raw body not available",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    console.log("🔐 Signature verification:", {
      expected: expectedSignature.substring(0, 20) + "...",
      received: razorpaySignature.substring(0, 20) + "...",
      match: expectedSignature === razorpaySignature,
    });

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ BLOCKED: Webhook signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Invalid signature - webhook rejected",
      });
    }

    console.log("✅ Signature verified successfully");

    const webhookEvent = JSON.parse(req.rawBody);
    const eventFromBody = webhookEvent.event;
    const finalEvent = eventType || eventFromBody;

    console.log(`🔔 Processing webhook event: ${finalEvent}`, {
      eventId: webhookEvent.id || "Not provided",
      entityId:
        webhookEvent.payload?.payment?.entity?.id ||
        webhookEvent.payload?.order?.entity?.id,
    });

    try {
      switch (finalEvent) {
        case "payment.captured":
          await handlePaymentCaptured(webhookEvent);
          break;

        case "payment.failed":
          await handlePaymentFailed(webhookEvent);
          break;

        case "order.paid":
          await handleOrderPaid(webhookEvent);
          break;

        case "payment.authorized":
          console.log(
            "💰 Payment authorized:",
            webhookEvent.payload?.payment?.entity?.id
          );
          break;

        default:
          console.log(`ℹ️ Unhandled webhook event: ${finalEvent}`);
      }

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        event: finalEvent,
      });
    } catch (processingError) {
      console.error("❌ Webhook processing error:", processingError);
      res.status(200).json({
        success: false,
        message: "Webhook processing failed but acknowledged",
      });
    }
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(200).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

const handlePaymentFailed = async (webhookEvent) => {
  try {
    const payment = webhookEvent.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    console.log(
      `❌ Payment failed: ${payment.id}, Razorpay Order: ${razorpayOrderId}`,
      {
        error: payment.error_description,
        code: payment.error_code,
      }
    );

    try {
      const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
      const { userId, sessionId, tempOrderData } = razorpayOrder.notes;

      if (tempOrderData) {
        const orderData = JSON.parse(tempOrderData);


      }

      await unlockCart(userId, sessionId);
    } catch (refundError) {
      console.error(
        "❌ Error refunding wallet amount on payment failure:",
        refundError
      );
    }

    console.log(`📝 Payment failed for Razorpay order: ${razorpayOrderId}`);
  } catch (error) {
    console.error("❌ Error in handlePaymentFailed:", error);
  }
};

const handleOrderPaid = async (webhookEvent) => {
  try {
    const razorpayOrder = webhookEvent.payload.order.entity;

    console.log(
      `✅ Order paid: ${razorpayOrder.id}, Amount: ${
        razorpayOrder.amount / 100
      }`
    );

    console.log(
      `ℹ️ Order.paid received for: ${razorpayOrder.id}, but order creation handled by payment.captured`
    );
  } catch (error) {
    console.error("❌ Error in handleOrderPaid:", error);
  }
};

const updateStockAndClearCart = async (order) => {
  try {
    if (order.stockUpdated) {
      console.log(
        `ℹ️ Stock already updated for order ${order.orderNumber}, skipping`
      );
      return;
    }

    const stockUpdates = [];
    for (const item of order.items) {
      const updatePromise = Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );
      stockUpdates.push(updatePromise);
    }

    await Promise.all(stockUpdates);

    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

    order.stockUpdated = true;
    await order.save();

    console.log(
      `📦 Stock updated and cart cleared for order ${order.orderNumber}`
    );
  } catch (error) {
    console.error("❌ Error updating stock and cart:", error);
    throw error;
  }
};

const restoreStock = async (order) => {
  try {
    const stockUpdates = [];
    for (const item of order.items) {
      const updatePromise = Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock: item.quantity },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );
      stockUpdates.push(updatePromise);
    }

    await Promise.all(stockUpdates);
    console.log(`📦 Stock restored for failed order ${order.orderNumber}`);
  } catch (error) {
    console.error("❌ Error restoring stock:", error);
  }
};

export const checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("🔍 Checking order status for:", orderId);

    if (orderId.startsWith("order_")) {
      console.log("🔍 Searching by Razorpay order ID:", orderId);

      const order = await Order.findOne({ razorpayOrderId: orderId });

      if (!order) {
        console.log("❌ Order not found with Razorpay ID:", orderId);
        return res.status(404).json({
          success: false,
          message: "Order not found. It may still be processing.",
          note: "Order is being processed. Please wait a moment and try again.",
        });
      }

      return res.json({
        success: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          totalAmount: order.totalAmount,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          failureReason: order.failureReason,
          shippingAddress: order.shippingAddress,
          items: order.items,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          webhookReceived: order.webhookReceived || false,
        },
      });
    } else {
      console.log("🔍 Searching by MongoDB ID:", orderId);

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.json({
        success: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          totalAmount: order.totalAmount,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          failureReason: order.failureReason,
          shippingAddress: order.shippingAddress,
          items: order.items,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          webhookReceived: order.webhookReceived || false,
        },
      });
    }
  } catch (error) {
    console.error("❌ Order status check error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
        note: "Please check your order ID and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to check order status",
    });
  }
};

export const validateCartStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const outOfStockItems = [];
    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "One or more products in cart are missing",
        });
      }

      if (item.productId.stock < item.quantity) {
        outOfStockItems.push({
          name: item.productId.name,
          requested: item.quantity,
          available: item.productId.stock,
        });
      }
    }

    if (outOfStockItems.length > 0) {
      const message = outOfStockItems
        .map(
          (item) =>
            `"${item.name}" (requested ${item.requested}, available ${item.available})`
        )
        .join(", ");
      return res.status(400).json({
        success: false,
        message: `Insufficient stock: ${message}`,
        outOfStockItems,
      });
    }

    return res.json({
      success: true,
      message: "Cart items are in stock",
    });
  } catch (error) {
    console.error("Stock validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate cart stock",
    });
  }
};

const calculateDiscountAmount = (coupon, subtotal) => {
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subtotal);
};

export const createPaymentFromCart = async (req, res) => {
  let cartLocked = false;

  try {
    const {
      shippingAddress,
      couponCode,
    } = req.body;
    const userId = req.user.id;
    const sessionId = req.cartSessionId;

    console.log("💰 Creating payment with session:", sessionId);

    const user = await AuthModel.findById(userId);
    if (!user) {
      await unlockCart(userId, sessionId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price stock images slug"
    );

    if (!cart || cart.items.length === 0) {
      await unlockCart(userId, sessionId);
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!cart.isLocked || cart.lockSessionId !== sessionId) {
      return res.status(423).json({
        success: false,
        message: "Cart session expired. Please refresh and try again.",
        code: "SESSION_EXPIRED",
      });
    }

    cartLocked = true;

    const subtotal = cart.items.reduce((total, item) => {
      const itemPrice = item.productId?.price || item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + itemPrice * itemQuantity;
    }, 0);

    console.log("📊 Cart subtotal calculation:", {
      subtotal,
      itemsCount: cart.items.length,
      items: cart.items.map((item) => ({
        price: item.productId?.price || item.price,
        quantity: item.quantity,
      })),
    });

    let discountAmount = 0;
    let appliedCoupon = null;
    let finalAmount = subtotal;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        discountAmount = calculateDiscountAmount(coupon, subtotal);
        finalAmount = subtotal - discountAmount;
        
        appliedCoupon = {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
        };
      }
    }

    let razorpayAmount = finalAmount;

    if (isNaN(razorpayAmount) || razorpayAmount < 0) {
      throw new Error(`Invalid razorpay amount: ${razorpayAmount}`);
    }

    if (razorpayAmount < 1) {
      throw new Error("Razorpay amount must be at least 1 rupee");
    }

    const tempOrderData = {
      userId,
      sessionId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.images?.[0] || "",
        quantity: item.quantity,
        price: item.productId.price,
        selectedAttributes: item.selectedAttributes || {},
      })),
      subtotal,
      discountAmount,
      shippingCharges: 0,
      taxAmount: 0,
      totalAmount: finalAmount,

      appliedCoupon,
      shippingAddress: {
        ...shippingAddress,
        email: req.user.email,
      },
    };

    const razorpayAmountInPaise = Math.round(razorpayAmount * 100);
    const receiptId = `receipt_${sessionId}_${Date.now()}`.substring(0, 40);

    console.log("🔄 Creating Razorpay order with:", {
      amount: razorpayAmountInPaise,
      receipt: receiptId,
      razorpayAmount: razorpayAmount,
      currency: "INR",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId,
        sessionId,
        tempOrderData: JSON.stringify(tempOrderData),

      },
      payment_capture: 1,
    });

    cart.lastActivity = new Date();
    await cart.save();

    res.json({
      success: true,
      message: "Razorpay order created successfully",
      order: razorpayOrder,
      orderId: razorpayOrder.id,
      sessionId: sessionId,
      amountDetails: {
        subtotal: subtotal,
        discount: discountAmount,
        orderTotal: finalAmount,

      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    if (cartLocked && req.user?.id) {
      await unlockCart(req.user.id, req.cartSessionId);
    }



    if (error.error?.code === "BAD_REQUEST_ERROR") {
      return res.status(400).json({
        success: false,
        message: `Payment creation failed: ${error.error.description}`,
        error: error.error,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

const handlePaymentCaptured = async (webhookEvent) => {

  let sessionId = null;

  try {
    const payment = webhookEvent.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    console.log(
      `💰 Payment captured: ${payment.id}, Razorpay Order: ${razorpayOrderId}`,
      {
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
      }
    );

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
      console.log("📦 Razorpay order notes:", razorpayOrder.notes);
    } catch (error) {
      console.error("❌ Error fetching Razorpay order:", error);
      return;
    }

    const {
      tempOrderData,
      userId,
      sessionId: razorpaySessionId,
    } = razorpayOrder.notes;
    sessionId = razorpaySessionId;

    if (!tempOrderData) {
      console.error("❌ No tempOrderData found in Razorpay order notes");
      return;
    }

    const orderData = JSON.parse(tempOrderData);

    const existingOrder = await Order.findOne({
      razorpayOrderId: razorpayOrderId,
      paymentStatus: "completed",
    });

    if (existingOrder) {
      console.log(
        `🔄 Order ${existingOrder.orderNumber} already exists, skipping`
      );

      await unlockCart(userId, sessionId);
      return;
    }



    const order = await Order.create({
      ...orderData,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: payment.id,
      paymentStatus: "completed",
      orderStatus: "confirmed",
      paidAt: new Date(),
      webhookReceived: true,

    });

    console.log(`✅ Order created after payment: ${order.orderNumber}`);
    console.log(`📊 Final order summary:`, {
      "Razorpay Amount": `₹${payment.amount / 100}`,
      "Order Total": `₹${order.totalAmount}`,
    });

    await updateStockAndClearCart(order);

    await unlockCart(userId, sessionId);



    if (order.appliedCoupon && order.appliedCoupon.code) {
      const coupon = await Coupon.findOne({ code: order.appliedCoupon.code });

      if (coupon) {
        console.log(
          `🎫 Found coupon in database: ${coupon.code}, Type: ${coupon.coupantype}`
        );
        await CouponUsage.create({
          couponCode: order.appliedCoupon.code,
          userId: order.userId,
          orderId: order._id,
          discountAmount: order.discountAmount,
          originalAmount: order.subtotal,
          finalAmount: order.totalAmount,
          couponDetails: {
            discountType: order.appliedCoupon.discountType,
            discountValue: order.appliedCoupon.discountValue,
            maxDiscountAmount: order.appliedCoupon.maxDiscountAmount || null,
          },
        });

        console.log(
          `🎫 Coupon ${order.appliedCoupon.code} recorded for order ${order.orderNumber}`
        );
        await Coupon.findOneAndUpdate(
          { code: order.appliedCoupon.code },
          { $inc: { currentUsageCount: 1 } }
        );
      } else {
        console.error(
          `❌ Coupon not found in database: ${order.appliedCoupon.code}`
        );
      }
    } else {
      console.log("ℹ️ No coupon applied to this order");
    }

    console.log(
      `✅ Order ${order.orderNumber} completed and cart cleared via payment.captured webhook`
    );
  } catch (error) {
    console.error("❌ Error in handlePaymentCaptured:", error);



    if (sessionId && userId) {
      await unlockCart(userId, sessionId);
    }

    throw error;
  }
};



export const createCODOrder = async (req, res) => {
  let cartLocked = false;

  try {
    const {
      shippingAddress,
      couponCode,
    } = req.body;
    const userId = req.user.id;
    const sessionId = req.cartSessionId;

    console.log("🔄 Creating COD order for user:", userId);

    const user = await AuthModel.findById(userId);
    if (!user) {
      await unlockCart(userId, sessionId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price stock images slug"
    );

    if (!cart || cart.items.length === 0) {
      await unlockCart(userId, sessionId);
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!cart.isLocked || cart.lockSessionId !== sessionId) {
      return res.status(423).json({
        success: false,
        message: "Cart session expired. Please refresh and try again.",
        code: "SESSION_EXPIRED",
      });
    }

    cartLocked = true;

    const subtotal = cart.items.reduce((total, item) => {
      const itemPrice = item.productId?.price || item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + itemPrice * itemQuantity;
    }, 0);

    let discountAmount = 0;
    let appliedCoupon = null;
    let finalAmount = subtotal;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        discountAmount = calculateDiscountAmount(coupon, subtotal);
        finalAmount = subtotal - discountAmount;
        
        appliedCoupon = {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
        };
      }
    }

    const orderData = {
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.images?.[0] || "",
        quantity: item.quantity,
        price: item.productId.price,
        selectedAttributes: item.selectedAttributes || {},
      })),
      subtotal: subtotal,
      discountAmount: discountAmount,
      shippingCharges: 0,
      taxAmount: 0,
      totalAmount: finalAmount,
      appliedCoupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountAmount: appliedCoupon.discountAmount,
          }
        : undefined,
      shippingAddress: {
        ...shippingAddress,
        email: req.user.email,
      },
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "confirmed",
      sessionId: sessionId,
    };

    const order = await Order.create(orderData);

    console.log(`✅ COD order created: ${order.orderNumber}`);

    await updateStockAndClearCart(order);

    await unlockCart(userId, sessionId);

    if (order.appliedCoupon && order.appliedCoupon.code) {
      await Coupon.findOneAndUpdate(
        { code: order.appliedCoupon.code },
        { $inc: { currentUsageCount: 1 } }
      );
    }

    res.json({
      success: true,
      message: "COD order created successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
      },
    });

  } catch (error) {
    console.error("Create COD order error:", error);

    if (cartLocked && req.user?.id) {
        await unlockCart(req.user.id, req.cartSessionId);
    }

    res.status(500).json({
      success: false,
      message: "Failed to create COD order",
      error: error.message,
    });
  }
};


