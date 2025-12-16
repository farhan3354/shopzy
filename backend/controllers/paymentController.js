import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.js";
import Cart from "../models/cartModel.js";
import Product from "../models/product.js";
import CouponUsage from "../models/CouponUsage.js";
import Coupon from "../models/couponModel.js";
import { createCashbackRecord } from "./couponController.js";
import Referral from "../models/referralModel.js";
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

        if (orderData.walletDetails && orderData.walletDetails.usedWallet) {
          const user = await AuthModel.findById(userId);
          if (user && orderData.walletDetails.walletAmountUsed > 0) {
            const refundAmount = orderData.walletDetails.walletAmountUsed;

            user.walletbalance += refundAmount;
            user.walletTransactions = user.walletTransactions || [];
            user.walletTransactions.push({
              type: "refund",
              amount: refundAmount,
              for: "payment_failed",
              status: "completed",
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: payment.id,
              sessionId: sessionId,
              createdAt: new Date(),
            });

            await user.save();
            console.log(
              `✅ Wallet amount refunded for failed payment: ₹${refundAmount}, New balance: ₹${user.walletbalance}`
            );
          }
        }
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
  let walletDeduction = 0;
  let user = null;

  try {
    const {
      shippingAddress,
      couponCode,
      referralCode,
      useWallet,
      walletAmountUsed,
    } = req.body;
    const userId = req.user.id;
    const sessionId = req.cartSessionId;

    console.log("💰 Creating payment with session:", sessionId);

    user = await AuthModel.findById(userId);
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

    if (referralCode) {
      const referral = await Referral.findOne({
        referralCode: referralCode.toUpperCase(),
        isActive: true,
      }).populate("userId", "name email");

      if (referral) {
        appliedCoupon = {
          code: referral.referralCode,
          name: "Referral Bonus",
          description: `Referral from ${referral.userId.name}`,
          discountType: "referral",
          discountValue: 0,
          discountAmount: 0,
          isReferral: true,
          referrerId: referral.userId._id,
          referrerName: referral.userId.name,
        };
        console.log(`🔗 Referral code applied: ${referralCode}`);
      } else {
        console.log(`❌ Invalid referral code: ${referralCode}`);
      }
    } else if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        discountAmount = calculateDiscountAmount(coupon, subtotal);
        finalAmount =
          coupon.coupantype === "cashback"
            ? subtotal
            : Math.max(0, subtotal - discountAmount);

        appliedCoupon = {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount,
          isReferral: false,
          maxDiscountAmount: coupon.maxDiscountAmount,
          coupantype: coupon.coupantype,
        };
      }
    }

    let razorpayAmount = finalAmount;
    let walletBalanceBefore = user.walletbalance || 0;

    if (useWallet && walletAmountUsed > 0) {
      const currentUser = await AuthModel.findById(userId);
      const currentWalletBalance = currentUser.walletbalance || 0;

      if (currentWalletBalance < walletAmountUsed) {
        await unlockCart(userId, sessionId);
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance. Please refresh the page.",
        });
      }

      if (walletAmountUsed > finalAmount) {
        await unlockCart(userId, sessionId);
        return res.status(400).json({
          success: false,
          message: "Wallet amount cannot exceed order total",
        });
      }

      walletDeduction = walletAmountUsed;
      razorpayAmount = Math.max(0, finalAmount - walletDeduction);

      console.log(`💰 Wallet deduction for Razorpay:`, {
        walletBalanceBefore: walletBalanceBefore,
        walletAmountUsed: walletDeduction,
        orderTotal: finalAmount,
        razorpayAmount: razorpayAmount,
      });

      user.walletbalance -= walletDeduction;
      user.walletTransactions = user.walletTransactions || [];
      user.walletTransactions.push({
        type: "reserved",
        amount: -walletDeduction,
        for: "razorpay_payment",
        status: "pending",
        sessionId: sessionId,
        cartSessionId: sessionId,
        createdAt: new Date(),
        orderData: {
          subtotal,
          discountAmount,
          finalAmount,
          razorpayAmount,
        },
      });

      await user.save();
      console.log(
        `✅ Wallet amount reserved for session ${sessionId}: ₹${walletDeduction}`
      );
    }

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
      walletDetails: {
        usedWallet: useWallet,
        walletAmountUsed: walletDeduction,
        walletBalanceBefore: walletBalanceBefore,
        razorpayAmount: razorpayAmount,
        sessionId: sessionId,
      },
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
        walletReserved: useWallet ? "true" : "false",
        reservedAmount: walletDeduction.toString(),
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
        walletUsed: walletDeduction,
        razorpayAmount: razorpayAmount,
        walletBalance: user.walletbalance,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    if (cartLocked && req.user?.id) {
      await unlockCart(req.user.id, req.cartSessionId);
    }

    if (walletDeduction > 0 && user) {
      try {
        user.walletbalance += walletDeduction;
        user.walletTransactions.push({
          type: "refund",
          amount: walletDeduction,
          for: "payment_creation_failed",
          status: "completed",
          sessionId: req.cartSessionId,
          createdAt: new Date(),
        });
        await user.save();
        console.log(
          `🔄 Wallet amount refunded due to payment creation failure: ₹${walletDeduction}`
        );
      } catch (refundError) {
        console.error("❌ Error refunding wallet balance:", refundError);
      }
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
  let walletDeduction = 0;
  let user = null;
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

    if (orderData.walletDetails && orderData.walletDetails.usedWallet) {
      user = await AuthModel.findById(userId);
      if (user) {
        walletDeduction = orderData.walletDetails.walletAmountUsed;

        if (walletDeduction > 0) {
          const pendingTransaction = user.walletTransactions?.find(
            (txn) =>
              txn.status === "pending" &&
              txn.for === "razorpay_payment" &&
              txn.sessionId === sessionId
          );

          if (pendingTransaction) {
            pendingTransaction.status = "completed";
            pendingTransaction.razorpayOrderId = razorpayOrderId;
            pendingTransaction.razorpayPaymentId = payment.id;
            pendingTransaction.completedAt = new Date();

            await user.save();
            console.log(
              `✅ Wallet transaction marked as completed: ₹${walletDeduction}`
            );
          } else {
            user.walletTransactions = user.walletTransactions || [];
            user.walletTransactions.push({
              type: "payment",
              amount: -walletDeduction,
              for: "order_payment",
              status: "completed",
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: payment.id,
              sessionId: sessionId,
              createdAt: new Date(),
              completedAt: new Date(),
            });
            await user.save();
            console.log(
              `✅ New wallet payment transaction created: ₹${walletDeduction}`
            );
          }
        }
      }
    }

    const order = await Order.create({
      ...orderData,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: payment.id,
      paymentStatus: "completed",
      orderStatus: "confirmed",
      paidAt: new Date(),
      webhookReceived: true,
      walletDetails: {
        ...orderData.walletDetails,
        walletAmountUsed: walletDeduction,
        walletBalanceAfter: user
          ? user.walletbalance
          : orderData.walletDetails.walletBalanceBefore,
      },
    });

    console.log(`✅ Order created after payment: ${order.orderNumber}`);
    console.log(`📊 Final order summary:`, {
      "Razorpay Amount": `₹${payment.amount / 100}`,
      "Wallet Used": `₹${walletDeduction}`,
      "Order Total": `₹${order.totalAmount}`,
      "Final Wallet Balance": user ? `₹${user.walletbalance}` : "N/A",
    });

    await updateStockAndClearCart(order);

    await unlockCart(userId, sessionId);

    await handleReferralOrder(order);

    if (order.appliedCoupon && order.appliedCoupon.code) {
      const isReferralCode = await Referral.exists({
        referralCode: order.appliedCoupon.code.toUpperCase(),
      });

      if (isReferralCode) {
        console.log(
          `🔗 Skipping coupon processing for referral code: ${order.appliedCoupon.code}`
        );
      } else {
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
              coupantype: coupon.coupantype,
            },
          });

          console.log(
            `🎫 Coupon ${order.appliedCoupon.code} recorded for order ${order.orderNumber}`
          );
          if (coupon.coupantype === "cashback") {
            console.log(
              `💰 Creating cashback record for cashback coupon: ${coupon.code}`
            );
            try {
              const cashbackRecord = await createCashbackRecord(order, coupon);
              if (cashbackRecord) {
                console.log(
                  `💰 Cashback record created successfully: ₹${cashbackRecord.cashbackAmount}`
                );
              }
            } catch (cashbackError) {
              console.error(
                "❌ Error creating cashback record:",
                cashbackError
              );
            }
          }
          await Coupon.findOneAndUpdate(
            { code: order.appliedCoupon.code },
            { $inc: { currentUsageCount: 1 } }
          );
        } else {
          console.error(
            `❌ Coupon not found in database: ${order.appliedCoupon.code}`
          );
        }
      }
    } else {
      console.log("ℹ️ No coupon applied to this order");
    }

    console.log(
      `✅ Order ${order.orderNumber} completed and cart cleared via payment.captured webhook`
    );
  } catch (error) {
    console.error("❌ Error in handlePaymentCaptured:", error);

    if (walletDeduction > 0 && user) {
      try {
        user.walletbalance += walletDeduction;
        user.walletTransactions = user.walletTransactions || [];
        user.walletTransactions.push({
          type: "refund",
          amount: walletDeduction,
          for: "order_creation_failed",
          status: "completed",
          razorpayOrderId: razorpayOrderId,
          sessionId: sessionId,
          createdAt: new Date(),
        });
        await user.save();
        console.log(
          `🔄 Wallet balance refunded due to order creation failure: ₹${walletDeduction}`
        );
      } catch (refundError) {
        console.error("❌ Error refunding wallet balance:", refundError);
      }
    }

    if (sessionId && userId) {
      await unlockCart(userId, sessionId);
    }

    throw error;
  }
};

const handleReferralOrder = async (order) => {
  try {
    console.log("🔄 Starting handleReferralOrder...");

    if (!order.appliedCoupon || !order.appliedCoupon.code) {
      console.log("ℹ️ No coupon/referral code applied to this order");
      return;
    }

    const appliedCode = order.appliedCoupon.code;
    console.log(`🔍 Checking code: ${appliedCode}`);

    const referral = await Referral.findOne({
      referralCode: appliedCode.toUpperCase(),
      isActive: true,
    }).populate("userId", "name email");

    if (!referral) {
      console.log(`❌ Code ${appliedCode} is not a referral code`);
      return;
    }

    console.log(
      `✅ Found referral code: ${appliedCode} for ${referral.userId.name}`
    );

    if (referral.userId._id.toString() === order.userId.toString()) {
      console.log("❌ User tried to use their own referral code");
      return;
    }

    const existingReferralOrder = await Referral.findOne({
      "referredOrders.referredByUserId": order.userId,
      "referredOrders.rewardStatus": { $in: ["pending", "approved"] },
    });

    if (existingReferralOrder) {
      console.log(
        "❌ User has already used a referral code in a previous order"
      );
      return;
    }

    const existingOrderReferral = await Referral.findOne({
      "referredOrders.orderId": order._id,
    });

    if (existingOrderReferral) {
      console.log("❌ This order was already referred");
      return;
    }

    const rewardAmount = calculateReferralReward(order.totalAmount);

    referral.referredOrders = referral.referredOrders || [];
    referral.referredOrders.push({
      orderId: order._id,
      referredByUserId: order.userId,
      orderAmount: order.totalAmount,
      rewardAmount: rewardAmount,
      rewardStatus: "pending",
      referredAt: new Date(),
    });

    referral.totalReferralOrders += 1;
    referral.pendingEarnings += rewardAmount;

    await referral.save();

    console.log(`✅ Referral order tracked successfully!`);
    console.log(
      `   - Referrer: ${referral.userId.name} (${referral.userId.email})`
    );
    console.log(`   - Order: ${order.orderNumber}`);
    console.log(`   - Order Amount: ₹${order.totalAmount}`);
    console.log(`   - Reward Amount: ₹${rewardAmount} (pending approval)`);

    await sendReferralNotification(referral, order, rewardAmount);
  } catch (error) {
    console.error("❌ Error handling referral order:", error);
  }
};

const calculateReferralReward = (orderAmount) => {
  const percentage = 5;
  const minReward = 50;
  const maxReward = 500;

  let reward = (orderAmount * percentage) / 100;
  reward = Math.max(reward, minReward);
  reward = Math.min(reward, maxReward);

  return Math.round(reward);
};

const sendReferralNotification = async (referral, order, rewardAmount) => {
  try {
    console.log(`📧 Referral notification: 
      Order ${order.orderNumber} used referral code ${referral.referralCode}
      Referrer: ${referral.userId.name} (${referral.userId.email})
      Reward Amount: ₹${rewardAmount}
      Please review and approve the reward.`);
  } catch (error) {
    console.error("❌ Error sending referral notification:", error);
  }
};

export const createCODOrder = async (req, res) => {
  let cartLocked = false;

  try {
    const {
      shippingAddress,
      couponCode,
      referralCode,
      useWallet,
      walletAmountUsed,
    } = req.body;
    const userId = req.user.id;
    const sessionId = req.cartSessionId;

    console.log("🔄 Creating COD order for user:", userId);
    console.log("💰 Wallet usage:", { useWallet, walletAmountUsed });
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

    if (referralCode) {
      const referral = await Referral.findOne({
        referralCode: referralCode.toUpperCase(),
        isActive: true,
      }).populate("userId", "name email");

      if (referral) {
        appliedCoupon = {
          code: referral.referralCode,
          name: "Referral Bonus",
          description: `Referral from ${referral.userId.name}`,
          discountType: "referral",
          discountValue: 0,
          discountAmount: 0,
          isReferral: true,
          referrerId: referral.userId._id,
          referrerName: referral.userId.name,
        };
        console.log(`🔗 Referral code applied: ${referralCode}`);
      }
    } else if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        discountAmount = calculateDiscountAmount(coupon, subtotal);
        finalAmount =
          coupon.coupantype === "cashback"
            ? subtotal
            : Math.max(0, subtotal - discountAmount);

        appliedCoupon = {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount,
          isReferral: false,
          maxDiscountAmount: coupon.maxDiscountAmount,
          coupantype: coupon.coupantype,
        };
      }
    }

    let walletDeduction = 0;

    if (useWallet && walletAmountUsed > 0) {
      if (user.walletbalance < walletAmountUsed) {
        await unlockCart(userId, sessionId);
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      if (walletAmountUsed > finalAmount) {
        await unlockCart(userId, sessionId);
        return res.status(400).json({
          success: false,
          message: "Wallet amount cannot exceed order total",
        });
      }

      walletDeduction = walletAmountUsed;
      finalAmount = Math.max(0, finalAmount - walletDeduction);

      console.log(
        `💰 Wallet deduction: ₹${walletDeduction}, Final amount: ₹${finalAmount}`
      );

      user.walletbalance -= walletDeduction;
      user.walletTransactions = user.walletTransactions || [];
      user.walletTransactions.push({
        type: "payment",
        amount: -walletDeduction,
        for: "cod_order",
        status: "completed",
        sessionId: sessionId,
        createdAt: new Date(),
        completedAt: new Date(),
      });

      await user.save();

      console.log(`✅ Wallet balance updated: ₹${user.walletbalance}`);
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
    console.log(
      `📊 Order summary: Subtotal: ₹${subtotal}, Discount: ₹${discountAmount}, Wallet: ₹${walletDeduction}, Final: ₹${finalAmount}`
    );

    await updateStockAndClearCart(order);

    await unlockCart(userId, sessionId);

    await handleReferralOrder(order);

    if (order.appliedCoupon && order.appliedCoupon.code) {
      const isReferralCode = await Referral.exists({
        referralCode: order.appliedCoupon.code.toUpperCase(),
      });

      if (!isReferralCode) {
        const coupon = await Coupon.findOne({ code: order.appliedCoupon.code });

        if (coupon) {
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
              coupantype: coupon.coupantype,
            },
          });

          if (coupon.coupantype === "cashback") {
            try {
              await createCashbackRecord(order, coupon);
            } catch (cashbackError) {
              console.error(
                "❌ Error creating cashback record:",
                cashbackError
              );
            }
          }

          await Coupon.findOneAndUpdate(
            { code: order.appliedCoupon.code },
            { $inc: { currentUsageCount: 1 } }
          );
        }
      }
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
        walletDeduction: walletDeduction,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        remainingWalletBalance: user.walletbalance,
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

// import Razorpay from "razorpay";
// import crypto from "crypto";
// import Order from "../models/order.js";
// import Cart from "../models/cartModel.js";
// import Product from "../models/product.js";
// import CouponUsage from "../models/CouponUsage.js";
// import Coupon from "../models/couponModel.js";
// import { createCashbackRecord } from "./couponController.js";
// import Referral from "../models/referralModel.js";
// import AuthModel from "../models/authModel.js";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
// export const razorpayWebhook = async (req, res) => {
//   try {
//     console.log("🪝 Webhook received at:", new Date().toISOString());

//     const razorpaySignature = req.headers["x-razorpay-signature"];
//     const webhookId = req.headers["x-razorpay-event-id"];
//     const eventType = req.headers["x-razorpay-event"];

//     console.log("🔐 Webhook details:", {
//       event: eventType,
//       webhookId: webhookId || "Not provided",
//       signaturePresent: !!razorpaySignature,
//     });

//     // ✅ STRICT signature verification
//     if (!razorpaySignature) {
//       console.error("❌ BLOCKED: No signature in webhook");
//       return res.status(400).json({
//         success: false,
//         message: "Invalid webhook - signature required",
//       });
//     }

//     if (!req.rawBody) {
//       console.error("❌ BLOCKED: No raw body available");
//       return res.status(400).json({
//         success: false,
//         message: "Raw body not available",
//       });
//     }

//     const expectedSignature = crypto
//       .createHmac("sha256", WEBHOOK_SECRET)
//       .update(req.rawBody)
//       .digest("hex");

//     console.log("🔐 Signature verification:", {
//       expected: expectedSignature.substring(0, 20) + "...",
//       received: razorpaySignature.substring(0, 20) + "...",
//       match: expectedSignature === razorpaySignature,
//     });

//     if (expectedSignature !== razorpaySignature) {
//       console.error("❌ BLOCKED: Webhook signature verification failed");
//       return res.status(400).json({
//         success: false,
//         message: "Invalid signature - webhook rejected",
//       });
//     }

//     console.log("✅ Signature verified successfully");

//     const webhookEvent = JSON.parse(req.rawBody);
//     const eventFromBody = webhookEvent.event;
//     const finalEvent = eventType || eventFromBody;

//     console.log(`🔔 Processing webhook event: ${finalEvent}`, {
//       eventId: webhookEvent.id || "Not provided",
//       entityId:
//         webhookEvent.payload?.payment?.entity?.id ||
//         webhookEvent.payload?.order?.entity?.id,
//     });

//     try {
//       switch (finalEvent) {
//         case "payment.captured":
//           await handlePaymentCaptured(webhookEvent);
//           break;

//         case "payment.failed":
//           await handlePaymentFailed(webhookEvent);
//           break;

//         case "order.paid":
//           await handleOrderPaid(webhookEvent);
//           break;

//         case "payment.authorized":
//           console.log(
//             "💰 Payment authorized:",
//             webhookEvent.payload?.payment?.entity?.id
//           );
//           break;

//         default:
//           console.log(`ℹ️ Unhandled webhook event: ${finalEvent}`);
//       }

//       res.status(200).json({
//         success: true,
//         message: "Webhook processed successfully",
//         event: finalEvent,
//       });
//     } catch (processingError) {
//       console.error("❌ Webhook processing error:", processingError);
//       res.status(200).json({
//         success: false,
//         message: "Webhook processing failed but acknowledged",
//       });
//     }
//   } catch (error) {
//     console.error("❌ Webhook processing error:", error);
//     res.status(200).json({
//       success: false,
//       message: "Webhook processing failed",
//     });
//   }
// };
// const handlePaymentFailed = async (webhookEvent) => {
//   try {
//     const payment = webhookEvent.payload.payment.entity;
//     const razorpayOrderId = payment.order_id;

//     console.log(
//       `❌ Payment failed: ${payment.id}, Razorpay Order: ${razorpayOrderId}`,
//       {
//         error: payment.error_description,
//         code: payment.error_code,
//       }
//     );

//     // No order to update since we don't create orders before payment
//     console.log(`📝 Payment failed for Razorpay order: ${razorpayOrderId}`);
//   } catch (error) {
//     console.error("❌ Error in handlePaymentFailed:", error);
//   }
// };

// const handleOrderPaid = async (webhookEvent) => {
//   try {
//     const razorpayOrder = webhookEvent.payload.order.entity;

//     console.log(
//       `✅ Order paid: ${razorpayOrder.id}, Amount: ${
//         razorpayOrder.amount / 100
//       }`
//     );

//     // This is a backup handler - payment.captured should handle order creation
//     console.log(
//       `ℹ️ Order.paid received for: ${razorpayOrder.id}, but order creation handled by payment.captured`
//     );
//   } catch (error) {
//     console.error("❌ Error in handleOrderPaid:", error);
//   }
// };

// const updateStockAndClearCart = async (order) => {
//   try {
//     // ✅ Check if stock was already updated
//     if (order.stockUpdated) {
//       console.log(
//         `ℹ️ Stock already updated for order ${order.orderNumber}, skipping`
//       );
//       return;
//     }

//     const stockUpdates = [];
//     for (const item of order.items) {
//       const updatePromise = Product.findByIdAndUpdate(
//         item.productId,
//         {
//           $inc: { stock: -item.quantity },
//           $set: { updatedAt: new Date() },
//         },
//         { new: true }
//       );
//       stockUpdates.push(updatePromise);
//     }

//     await Promise.all(stockUpdates);

//     // ✅ Clear user's cart
//     await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

//     // ✅ Mark order as stock updated to prevent duplicates
//     order.stockUpdated = true;
//     await order.save();

//     console.log(
//       `📦 Stock updated and cart cleared for order ${order.orderNumber}`
//     );
//   } catch (error) {
//     console.error("❌ Error updating stock and cart:", error);
//     throw error;
//   }
// };

// const restoreStock = async (order) => {
//   try {
//     const stockUpdates = [];
//     for (const item of order.items) {
//       const updatePromise = Product.findByIdAndUpdate(
//         item.productId,
//         {
//           $inc: { stock: item.quantity },
//           $set: { updatedAt: new Date() },
//         },
//         { new: true }
//       );
//       stockUpdates.push(updatePromise);
//     }

//     await Promise.all(stockUpdates);
//     console.log(`📦 Stock restored for failed order ${order.orderNumber}`);
//   } catch (error) {
//     console.error("❌ Error restoring stock:", error);
//   }
// };

// export const checkOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     console.log("🔍 Checking order status for:", orderId);

//     // ✅ Check if it's a Razorpay order ID (starts with "order_")
//     if (orderId.startsWith("order_")) {
//       console.log("🔍 Searching by Razorpay order ID:", orderId);

//       // Search by razorpayOrderId since it's a Razorpay ID
//       const order = await Order.findOne({ razorpayOrderId: orderId });

//       if (!order) {
//         console.log("❌ Order not found with Razorpay ID:", orderId);
//         return res.status(404).json({
//           success: false,
//           message: "Order not found. It may still be processing.",
//           note: "Order is being processed. Please wait a moment and try again.",
//         });
//       }

//       return res.json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderNumber: order.orderNumber,
//           paymentStatus: order.paymentStatus,
//           orderStatus: order.orderStatus,
//           totalAmount: order.totalAmount,
//           razorpayOrderId: order.razorpayOrderId,
//           razorpayPaymentId: order.razorpayPaymentId,
//           failureReason: order.failureReason,
//           shippingAddress: order.shippingAddress,
//           items: order.items,
//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           webhookReceived: order.webhookReceived || false,
//         },
//       });
//     } else {
//       // ✅ It's a MongoDB ObjectId
//       console.log("🔍 Searching by MongoDB ID:", orderId);

//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({
//           success: false,
//           message: "Order not found",
//         });
//       }

//       return res.json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderNumber: order.orderNumber,
//           paymentStatus: order.paymentStatus,
//           orderStatus: order.orderStatus,
//           totalAmount: order.totalAmount,
//           razorpayOrderId: order.razorpayOrderId,
//           razorpayPaymentId: order.razorpayPaymentId,
//           failureReason: order.failureReason,
//           shippingAddress: order.shippingAddress,
//           items: order.items,
//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           webhookReceived: order.webhookReceived || false,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("❌ Order status check error:", error);

//     // Handle specific CastError for MongoDB ObjectId
//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order ID format",
//         note: "Please check your order ID and try again.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to check order status",
//     });
//   }
// };

// export const validateCartStock = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const cart = await Cart.findOne({ userId }).populate("items.productId");

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Your cart is empty",
//       });
//     }

//     const outOfStockItems = [];
//     for (const item of cart.items) {
//       if (!item.productId) {
//         return res.status(400).json({
//           success: false,
//           message: "One or more products in cart are missing",
//         });
//       }

//       if (item.productId.stock < item.quantity) {
//         outOfStockItems.push({
//           name: item.productId.name,
//           requested: item.quantity,
//           available: item.productId.stock,
//         });
//       }
//     }

//     if (outOfStockItems.length > 0) {
//       const message = outOfStockItems
//         .map(
//           (item) =>
//             `"${item.name}" (requested ${item.requested}, available ${item.available})`
//         )
//         .join(", ");
//       return res.status(400).json({
//         success: false,
//         message: `Insufficient stock: ${message}`,
//         outOfStockItems,
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Cart items are in stock",
//     });
//   } catch (error) {
//     console.error("Stock validation error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to validate cart stock",
//     });
//   }
// };

// const calculateDiscountAmount = (coupon, subtotal) => {
//   let discount = 0;

//   if (coupon.discountType === "percentage") {
//     discount = (subtotal * coupon.discountValue) / 100;
//     if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
//       discount = coupon.maxDiscountAmount;
//     }
//   } else if (coupon.discountType === "fixed") {
//     discount = coupon.discountValue;
//   }

//   return Math.min(discount, subtotal);
// };

// export const createPaymentFromCart = async (req, res) => {
//   try {
//     const {
//       shippingAddress,
//       couponCode,
//       referralCode,
//       useWallet,
//       walletAmountUsed,
//     } = req.body;
//     const userId = req.user.id;

//     console.log("💰 Creating payment with wallet options:", {
//       useWallet,
//       walletAmountUsed,
//     });

//     // Get user data to check wallet balance
//     const user = await AuthModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Get cart data
//     const cart = await Cart.findOne({ userId }).populate(
//       "items.productId",
//       "name price stock images slug"
//     );

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty",
//       });
//     }

//     // Calculate order totals
//     const subtotal = cart.items.reduce((total, item) => {
//       return total + (item.productId.price || item.price) * item.quantity;
//     }, 0);

//     let discountAmount = 0;
//     let appliedCoupon = null;
//     let finalAmount = subtotal;

//     // ✅ Handle referral code first
//     if (referralCode) {
//       const referral = await Referral.findOne({
//         referralCode: referralCode.toUpperCase(),
//         isActive: true,
//       }).populate("userId", "name email");

//       if (referral) {
//         appliedCoupon = {
//           code: referral.referralCode,
//           name: "Referral Bonus",
//           description: `Referral from ${referral.userId.name}`,
//           discountType: "referral",
//           discountValue: 0,
//           discountAmount: 0,
//           isReferral: true,
//           referrerId: referral.userId._id,
//           referrerName: referral.userId.name,
//         };
//         console.log(`🔗 Referral code applied: ${referralCode}`);
//       } else {
//         console.log(`❌ Invalid referral code: ${referralCode}`);
//       }
//     }
//     // If no referral code, check for regular coupon
//     else if (couponCode) {
//       const coupon = await Coupon.findOne({
//         code: couponCode.toUpperCase(),
//         isActive: true,
//         startDate: { $lte: new Date() },
//         endDate: { $gte: new Date() },
//       });

//       if (coupon) {
//         discountAmount = calculateDiscountAmount(coupon, subtotal);
//         finalAmount =
//           coupon.coupantype === "cashback"
//             ? subtotal
//             : subtotal - discountAmount;

//         appliedCoupon = {
//           code: coupon.code,
//           name: coupon.name,
//           description: coupon.description,
//           discountType: coupon.discountType,
//           discountValue: coupon.discountValue,
//           discountAmount: discountAmount,
//           isReferral: false,
//           maxDiscountAmount: coupon.maxDiscountAmount,
//           coupantype: coupon.coupantype,
//         };
//       }
//     }

//     // Handle wallet balance deduction for Razorpay payment
//     let walletDeduction = 0;
//     let razorpayAmount = finalAmount;
//     let walletBalanceBefore = user.walletbalance;

//     if (useWallet && walletAmountUsed > 0) {
//       // Validate wallet balance
//       if (user.walletbalance < walletAmountUsed) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet balance",
//         });
//       }

//       // Validate wallet amount doesn't exceed final amount
//       if (walletAmountUsed > finalAmount) {
//         return res.status(400).json({
//           success: false,
//           message: "Wallet amount cannot exceed order total",
//         });
//       }

//       walletDeduction = walletAmountUsed;
//       razorpayAmount = finalAmount - walletDeduction;

//       console.log(`💰 Wallet deduction for Razorpay:`, {
//         walletBalanceBefore: walletBalanceBefore,
//         walletAmountUsed: walletDeduction,
//         orderTotal: finalAmount,
//         razorpayAmount: razorpayAmount,
//       });
//     }

//     // Create temporary order data for Razorpay notes
//     const tempOrderData = {
//       userId,
//       items: cart.items.map((item) => ({
//         productId: item.productId._id,
//         productName: item.productId.name,
//         productImage: item.productId.images?.[0] || "",
//         quantity: item.quantity,
//         price: item.productId.price,
//         selectedAttributes: item.selectedAttributes || {},
//       })),
//       subtotal,
//       discountAmount,
//       shippingCharges: 0,
//       taxAmount: 0,
//       totalAmount: finalAmount, // Original total before wallet deduction
//       walletDetails: {
//         usedWallet: useWallet,
//         walletAmountUsed: walletDeduction,
//         walletBalanceBefore: walletBalanceBefore,
//         razorpayAmount: razorpayAmount, // Amount to be paid via Razorpay
//         remainingAmount: razorpayAmount, // Same as razorpayAmount for consistency
//       },
//       appliedCoupon, // This includes isReferral flag
//       shippingAddress: {
//         ...shippingAddress,
//         email: req.user.email,
//       },
//     };

//     // Create Razorpay order with the calculated amount (after wallet deduction)
//     const razorpayOrder = await razorpay.orders.create({
//       amount: razorpayAmount * 100, // Convert to paise (use razorpayAmount, not finalAmount)
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         userId,
//         tempOrderData: JSON.stringify(tempOrderData),
//       },
//       payment_capture: 1,
//     });

//     res.json({
//       success: true,
//       message: "Razorpay order created successfully",
//       order: razorpayOrder,
//       orderId: razorpayOrder.id,
//       amountDetails: {
//         subtotal: subtotal,
//         discount: discountAmount,
//         orderTotal: finalAmount,
//         walletUsed: walletDeduction,
//         razorpayAmount: razorpayAmount,
//         walletBalance: user.walletbalance,
//       },
//     });
//   } catch (error) {
//     console.error("Create payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create payment order",
//     });
//   }
// };

// const handlePaymentCaptured = async (webhookEvent) => {
//   try {
//     const payment = webhookEvent.payload.payment.entity;
//     const razorpayOrderId = payment.order_id;

//     console.log(
//       `💰 Payment captured: ${payment.id}, Razorpay Order: ${razorpayOrderId}`,
//       {
//         amount: payment.amount / 100,
//         currency: payment.currency,
//         status: payment.status,
//       }
//     );

//     // ✅ Get the temporary order data from Razorpay order notes
//     let razorpayOrder;
//     try {
//       razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
//       console.log("📦 Razorpay order notes:", razorpayOrder.notes);
//     } catch (error) {
//       console.error("❌ Error fetching Razorpay order:", error);
//       return;
//     }

//     // ✅ Extract order data from notes
//     const { tempOrderData, userId } = razorpayOrder.notes;

//     if (!tempOrderData) {
//       console.error("❌ No tempOrderData found in Razorpay order notes");
//       return;
//     }

//     const orderData = JSON.parse(tempOrderData);

//     // ✅ Check if order already exists (prevent duplicates)
//     const existingOrder = await Order.findOne({
//       razorpayOrderId: razorpayOrderId,
//       paymentStatus: "completed",
//     });

//     if (existingOrder) {
//       console.log(
//         `🔄 Order ${existingOrder.orderNumber} already exists, skipping`
//       );
//       return;
//     }

//     // ✅ DEDUCT WALLET AMOUNT AFTER SUCCESSFUL PAYMENT
//     let walletDeduction = 0;
//     let user = null;

//     if (orderData.walletDetails && orderData.walletDetails.usedWallet) {
//       user = await AuthModel.findById(userId);
//       if (user) {
//         walletDeduction = orderData.walletDetails.walletAmountUsed;

//         if (walletDeduction > 0 && user.walletbalance >= walletDeduction) {
//           // Deduct wallet amount
//           user.walletbalance -= walletDeduction;
//           await user.save();
//           console.log(`✅ Wallet amount deducted: ₹${walletDeduction}, New balance: ₹${user.walletbalance}`);
//         } else {
//           console.log(`❌ Cannot deduct wallet amount: ${walletDeduction}, User balance: ${user.walletbalance}`);
//           walletDeduction = 0; // Reset if deduction failed
//         }
//       }
//     }

//     // ✅ CREATE THE ACTUAL ORDER IN DATABASE
//     const order = await Order.create({
//       ...orderData,
//       razorpayOrderId: razorpayOrderId,
//       razorpayPaymentId: payment.id,
//       paymentStatus: "completed",
//       orderStatus: "confirmed",
//       paidAt: new Date(),
//       webhookReceived: true,
//       // Update wallet details with actual deduction
//       walletDetails: {
//         ...orderData.walletDetails,
//         walletAmountUsed: walletDeduction,
//         walletBalanceAfter: user ? user.walletbalance : orderData.walletDetails.walletBalanceBefore
//       }
//     });

//     console.log(`✅ Order created after payment: ${order.orderNumber}`);
//     console.log(`📊 Final order summary:`, {
//       'Razorpay Amount': `₹${payment.amount / 100}`,
//       'Wallet Used': `₹${walletDeduction}`,
//       'Order Total': `₹${order.totalAmount}`,
//       'Final Wallet Balance': user ? `₹${user.walletbalance}` : 'N/A'
//     });

//     // ✅ Update stock and clear cart
//     await updateStockAndClearCart(order);

//     // ✅ Handle Referral Code FIRST (before coupon processing)
//     await handleReferralOrder(order);

//     // ✅ FIXED: Only process regular coupons, skip if it's a referral code
//     if (order.appliedCoupon && order.appliedCoupon.code) {
//       // ✅ Check if it's actually a referral code before processing as coupon
//       const isReferralCode = await Referral.exists({
//         referralCode: order.appliedCoupon.code.toUpperCase(),
//       });

//       if (isReferralCode) {
//         console.log(
//           `🔗 Skipping coupon processing for referral code: ${order.appliedCoupon.code}`
//         );
//       } else {
//         // Process as regular coupon
//         const coupon = await Coupon.findOne({ code: order.appliedCoupon.code });

//         if (coupon) {
//           console.log(
//             `🎫 Found coupon in database: ${coupon.code}, Type: ${coupon.coupantype}`
//           );

//           // Create coupon usage record
//           await CouponUsage.create({
//             couponCode: order.appliedCoupon.code,
//             userId: order.userId,
//             orderId: order._id,
//             discountAmount: order.discountAmount,
//             originalAmount: order.subtotal,
//             finalAmount: order.totalAmount,
//             couponDetails: {
//               discountType: order.appliedCoupon.discountType,
//               discountValue: order.appliedCoupon.discountValue,
//               maxDiscountAmount: order.appliedCoupon.maxDiscountAmount || null,
//               coupantype: coupon.coupantype,
//             },
//           });

//           console.log(
//             `🎫 Coupon ${order.appliedCoupon.code} recorded for order ${order.orderNumber}`
//           );

//           // CREATE CASHBACK RECORD FOR CASHBACK COUPONS ONLY
//           if (coupon.coupantype === "cashback") {
//             console.log(
//               `💰 Creating cashback record for cashback coupon: ${coupon.code}`
//             );
//             try {
//               const cashbackRecord = await createCashbackRecord(order, coupon);
//               if (cashbackRecord) {
//                 console.log(
//                   `💰 Cashback record created successfully: ₹${cashbackRecord.cashbackAmount}`
//                 );
//               }
//             } catch (cashbackError) {
//               console.error(
//                 "❌ Error creating cashback record:",
//                 cashbackError
//               );
//             }
//           }

//           // Update coupon usage count
//           await Coupon.findOneAndUpdate(
//             { code: order.appliedCoupon.code },
//             { $inc: { currentUsageCount: 1 } }
//           );
//         } else {
//           console.error(
//             `❌ Coupon not found in database: ${order.appliedCoupon.code}`
//           );
//         }
//       }
//     } else {
//       console.log("ℹ️ No coupon applied to this order");
//     }

//     console.log(
//       `✅ Order ${order.orderNumber} completed and cart cleared via payment.captured webhook`
//     );
//   } catch (error) {
//     console.error("❌ Error in handlePaymentCaptured:", error);

//     // If wallet was deducted but order creation failed, refund the wallet amount
//     if (walletDeduction > 0 && user) {
//       try {
//         user.walletbalance += walletDeduction;
//         await user.save();
//         console.log(`🔄 Wallet balance refunded due to order creation failure: ₹${walletDeduction}`);
//       } catch (refundError) {
//         console.error("❌ Error refunding wallet balance:", refundError);
//       }
//     }

//     throw error;
//   }
// };

// const handleReferralOrder = async (order) => {
//   try {
//     console.log("🔄 Starting handleReferralOrder...");

//     if (!order.appliedCoupon || !order.appliedCoupon.code) {
//       console.log("ℹ️ No coupon/referral code applied to this order");
//       return;
//     }

//     const appliedCode = order.appliedCoupon.code;
//     console.log(`🔍 Checking code: ${appliedCode}`);

//     // ✅ SMART APPROACH: Check if it's a referral code by querying the Referral collection
//     const referral = await Referral.findOne({
//       referralCode: appliedCode.toUpperCase(),
//       isActive: true,
//     }).populate("userId", "name email");

//     if (!referral) {
//       console.log(`❌ Code ${appliedCode} is not a referral code`);
//       return;
//     }

//     console.log(
//       `✅ Found referral code: ${appliedCode} for ${referral.userId.name}`
//     );

//     // Check if user is referring themselves
//     if (referral.userId._id.toString() === order.userId.toString()) {
//       console.log("❌ User tried to use their own referral code");
//       return;
//     }

//     // Check if this user has already used a referral code
//     const existingReferralOrder = await Referral.findOne({
//       "referredOrders.referredByUserId": order.userId,
//       "referredOrders.rewardStatus": { $in: ["pending", "approved"] },
//     });

//     if (existingReferralOrder) {
//       console.log(
//         "❌ User has already used a referral code in a previous order"
//       );
//       return;
//     }

//     // Check if this specific order was already referred
//     const existingOrderReferral = await Referral.findOne({
//       "referredOrders.orderId": order._id,
//     });

//     if (existingOrderReferral) {
//       console.log("❌ This order was already referred");
//       return;
//     }

//     // Calculate reward amount
//     const rewardAmount = calculateReferralReward(order.totalAmount);

//     // Add to referred orders array
//     referral.referredOrders.push({
//       orderId: order._id,
//       referredByUserId: order.userId,
//       orderAmount: order.totalAmount,
//       rewardAmount: rewardAmount,
//       rewardStatus: "pending",
//       referredAt: new Date(),
//     });

//     referral.totalReferralOrders += 1;
//     referral.pendingEarnings += rewardAmount;

//     await referral.save();

//     console.log(`✅ Referral order tracked successfully!`);
//     console.log(
//       `   - Referrer: ${referral.userId.name} (${referral.userId.email})`
//     );
//     console.log(`   - Order: ${order.orderNumber}`);
//     console.log(`   - Order Amount: ₹${order.totalAmount}`);
//     console.log(`   - Reward Amount: ₹${rewardAmount} (pending approval)`);

//     // Send notification to admin
//     await sendReferralNotification(referral, order, rewardAmount);
//   } catch (error) {
//     console.error("❌ Error handling referral order:", error);
//   }
// };

// const calculateReferralReward = (orderAmount) => {
//   // Customize this logic as per your business rules
//   const percentage = 5; // 5% of order amount
//   const minReward = 50;
//   const maxReward = 500;

//   let reward = (orderAmount * percentage) / 100;
//   reward = Math.max(reward, minReward);
//   reward = Math.min(reward, maxReward);

//   return Math.round(reward);
// };

// const sendReferralNotification = async (referral, order, rewardAmount) => {
//   try {
//     console.log(`📧 Referral notification:
//       Order ${order.orderNumber} used referral code ${referral.referralCode}
//       Referrer: ${referral.userId.name} (${referral.userId.email})
//       Reward Amount: ₹${rewardAmount}
//       Please review and approve the reward.`);

//     // You can add actual notification logic here (email, database notification, etc.)
//   } catch (error) {
//     console.error("❌ Error sending referral notification:", error);
//   }
// };

// export const createCODOrder = async (req, res) => {
//   try {
//     const {
//       shippingAddress,
//       couponCode,
//       referralCode,
//       useWallet,
//       walletAmountUsed,
//     } = req.body;
//     const userId = req.user.id;

//     console.log("🔄 Creating COD order for user:", userId);
//     console.log("💰 Wallet usage:", { useWallet, walletAmountUsed });

//     // Get user data to check wallet balance
//     const user = await AuthModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Get cart data
//     const cart = await Cart.findOne({ userId }).populate(
//       "items.productId",
//       "name price stock images slug"
//     );

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty",
//       });
//     }

//     // Validate stock
//     for (const item of cart.items) {
//       if (!item.productId) {
//         return res.status(400).json({
//           success: false,
//           message: "One or more products in cart are missing",
//         });
//       }

//       if (item.productId.stock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `"${item.productId.name}" is out of stock. Available: ${item.productId.stock}`,
//         });
//       }
//     }

//     // Calculate order totals
//     const subtotal = cart.items.reduce((total, item) => {
//       return total + (item.productId.price || item.price) * item.quantity;
//     }, 0);

//     let discountAmount = 0;
//     let appliedCoupon = null;
//     let finalAmount = subtotal;

//     // Handle referral code
//     if (referralCode) {
//       const referral = await Referral.findOne({
//         referralCode: referralCode.toUpperCase(),
//         isActive: true,
//       }).populate("userId", "name email");

//       if (referral) {
//         appliedCoupon = {
//           code: referral.referralCode,
//           name: "Referral Bonus",
//           description: `Referral from ${referral.userId.name}`,
//           discountType: "referral",
//           discountValue: 0,
//           discountAmount: 0,
//           isReferral: true,
//           referrerId: referral.userId._id,
//           referrerName: referral.userId.name,
//         };
//         console.log(`🔗 Referral code applied: ${referralCode}`);
//       }
//     }
//     // Handle regular coupon
//     else if (couponCode) {
//       const coupon = await Coupon.findOne({
//         code: couponCode.toUpperCase(),
//         isActive: true,
//         startDate: { $lte: new Date() },
//         endDate: { $gte: new Date() },
//       });

//       if (coupon) {
//         discountAmount = calculateDiscountAmount(coupon, subtotal);
//         finalAmount =
//           coupon.coupantype === "cashback"
//             ? subtotal
//             : subtotal - discountAmount;

//         appliedCoupon = {
//           code: coupon.code,
//           name: coupon.name,
//           description: coupon.description,
//           discountType: coupon.discountType,
//           discountValue: coupon.discountValue,
//           discountAmount: discountAmount,
//           isReferral: false,
//           maxDiscountAmount: coupon.maxDiscountAmount,
//           coupantype: coupon.coupantype,
//         };
//       }
//     }

//     // Handle wallet balance deduction
//     let walletDeduction = 0;

//     if (useWallet && walletAmountUsed > 0) {
//       // Validate wallet balance
//       if (user.walletbalance < walletAmountUsed) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient wallet balance",
//         });
//       }

//       // Validate wallet amount doesn't exceed final amount
//       if (walletAmountUsed > finalAmount) {
//         return res.status(400).json({
//           success: false,
//           message: "Wallet amount cannot exceed order total",
//         });
//       }

//       walletDeduction = walletAmountUsed;
//       finalAmount = finalAmount - walletDeduction;

//       console.log(
//         `💰 Wallet deduction: ₹${walletDeduction}, Final amount: ₹${finalAmount}`
//       );

//       // Update user's wallet balance
//       user.walletbalance -= walletDeduction;
//       await user.save();

//       console.log(`✅ Wallet balance updated: ₹${user.walletbalance}`);
//     }

//     // Create order data - using existing schema fields
//     const orderData = {
//       userId,
//       items: cart.items.map((item) => ({
//         productId: item.productId._id,
//         productName: item.productId.name,
//         productImage: item.productId.images?.[0] || "",
//         quantity: item.quantity,
//         price: item.productId.price,
//         selectedAttributes: item.selectedAttributes || {},
//       })),
//       subtotal: subtotal,
//       discountAmount: discountAmount,
//       shippingCharges: 0,
//       taxAmount: 0,
//       totalAmount: finalAmount, // This will be the final amount after wallet deduction
//       appliedCoupon: appliedCoupon
//         ? {
//             code: appliedCoupon.code,
//             discountAmount: appliedCoupon.discountAmount,
//           }
//         : undefined,
//       shippingAddress: {
//         ...shippingAddress,
//         email: req.user.email,
//       },
//       paymentMethod: "cod",
//       paymentStatus: "pending",
//       orderStatus: "confirmed",
//     };

//     // Create the order
//     const order = await Order.create(orderData);

//     console.log(`✅ COD order created: ${order.orderNumber}`);
//     console.log(
//       `📊 Order summary: Subtotal: ₹${subtotal}, Discount: ₹${discountAmount}, Wallet: ₹${walletDeduction}, Final: ₹${finalAmount}`
//     );

//     // Update stock and clear cart
//     await updateStockAndClearCart(order);

//     // Handle referral order
//     await handleReferralOrder(order);

//     // Handle coupon processing (similar to Razorpay flow)
//     if (order.appliedCoupon && order.appliedCoupon.code) {
//       const isReferralCode = await Referral.exists({
//         referralCode: order.appliedCoupon.code.toUpperCase(),
//       });

//       if (!isReferralCode) {
//         const coupon = await Coupon.findOne({ code: order.appliedCoupon.code });

//         if (coupon) {
//           // Create coupon usage record
//           await CouponUsage.create({
//             couponCode: order.appliedCoupon.code,
//             userId: order.userId,
//             orderId: order._id,
//             discountAmount: order.discountAmount,
//             originalAmount: order.subtotal,
//             finalAmount: order.totalAmount,
//             couponDetails: {
//               discountType: order.appliedCoupon.discountType,
//               discountValue: order.appliedCoupon.discountValue,
//               maxDiscountAmount: order.appliedCoupon.maxDiscountAmount || null,
//               coupantype: coupon.coupantype,
//             },
//           });

//           // Handle cashback for cashback coupons
//           if (coupon.coupantype === "cashback") {
//             try {
//               await createCashbackRecord(order, coupon);
//             } catch (cashbackError) {
//               console.error(
//                 "❌ Error creating cashback record:",
//                 cashbackError
//               );
//             }
//           }

//           // Update coupon usage count
//           await Coupon.findOneAndUpdate(
//             { code: order.appliedCoupon.code },
//             { $inc: { currentUsageCount: 1 } }
//           );
//         }
//       }
//     }

//     res.json({
//       success: true,
//       message: "COD order created successfully",
//       order: {
//         _id: order._id,
//         orderNumber: order.orderNumber,
//         totalAmount: order.totalAmount, // This shows the final amount after wallet deduction
//         subtotal: order.subtotal, // Original cart total
//         discountAmount: order.discountAmount, // Coupon discount
//         walletDeduction: walletDeduction, // Amount deducted from wallet
//         paymentMethod: order.paymentMethod,
//         paymentStatus: order.paymentStatus,
//         orderStatus: order.orderStatus,
//         remainingWalletBalance: user.walletbalance, // Updated wallet balance
//       },
//     });
//   } catch (error) {
//     console.error("Create COD order error:", error);

//     // If wallet was deducted but order failed, refund the amount
//     if (walletDeduction > 0 && user) {
//       try {
//         user.walletbalance += walletDeduction;
//         await user.save();
//         console.log(
//           `🔄 Wallet balance refunded due to order failure: ₹${walletDeduction}`
//         );
//       } catch (refundError) {
//         console.error("❌ Error refunding wallet balance:", refundError);
//       }
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create COD order",
//     });
//   }
// };
