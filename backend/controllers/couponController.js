import Coupon from "../models/couponModel.js";
import CouponUsage from "../models/CouponUsage.js";
import Cashback from "../models/cashbackModel.js";
import AuthModel from "../models/authModel.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minimumOrderAmount,
      minmumOrderQuanitity,
      totalUsageLimit,
      perUserLimit,
      startDate,
      endDate,
      applicableTo,
      categories,
      subcategories,
      coupantype = "discount",
    } = req.body;

    if (
      !code ||
      !name ||
      !description ||
      !discountType ||
      !discountValue ||
      !perUserLimit ||
      !startDate ||
      !endDate
    ) {
      return res
        .status(409)
        .json({ success: false, message: "All the fields are required" });
    }
    if (coupantype === "cashback") {
      if (discountType !== "percentage") {
        return res.status(400).json({
          success: false,
          message: "Cashback coupons must use percentage discount type",
        });
      }
      if (!maxDiscountAmount) {
        return res.status(400).json({
          success: false,
          message: "Cashback coupons require max discount amount",
        });
      }
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      maxDiscountAmount: maxDiscountAmount || null,
      minimumOrderAmount: minimumOrderAmount || 0,
      minmumOrderQuanitity: minmumOrderQuanitity || 0,
      totalUsageLimit: totalUsageLimit || null,
      perUserLimit: perUserLimit || 1,
      startDate,
      endDate,
      coupantype,
      applicableTo,
      categories: categories || [],
      subcategories: subcategories || [],
      createdBy: req.user.id,
    });

    await coupon.save();

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

export const createCashbackRecord = async (order, appliedCoupon) => {
  try {
    if (appliedCoupon && appliedCoupon.coupantype === "cashback") {
      const coupon = await Coupon.findById(
        appliedCoupon._id || appliedCoupon.couponId
      );

      if (coupon && coupon.coupantype === "cashback") {
        const cashbackAmount = calculateDiscountAmount(coupon, order.subtotal);

        const existingCashback = await Cashback.findOne({ orderId: order._id });
        if (existingCashback) {
          console.log(
            "💰 Cashback record already exists for order:",
            order.orderNumber
          );
          return existingCashback;
        }

        const cashbackRecord = new Cashback({
          userId: order.userId,
          orderId: order._id,
          couponCode: coupon.code,
          couponId: coupon._id,
          cashbackAmount: cashbackAmount,
          originalOrderAmount: order.subtotal,
          status: "pending",
        });

        await cashbackRecord.save();
        console.log(
          `💰 Cashback record created: ₹${cashbackAmount} for order ${order.orderNumber}`
        );

        return cashbackRecord;
      }
    }
    return null;
  } catch (error) {
    console.error("Error creating cashback record:", error);
    throw error;
  }
};

export const rejectCashback = async (req, res) => {
  try {
    const { cashbackId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const cashback = await Cashback.findById(cashbackId);

    if (!cashback) {
      return res.status(404).json({
        success: false,
        message: "Cashback record not found",
      });
    }

    if (cashback.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cashback is already ${cashback.status}`,
      });
    }

    cashback.status = "rejected";
    cashback.approvedBy = adminId;
    cashback.approvedAt = new Date();
    cashback.rejectionReason = rejectionReason || "No reason provided";
    await cashback.save();

    return res.json({
      success: true,
      message: "Cashback rejected successfully",
      cashback: {
        _id: cashback._id,
        status: cashback.status,
        rejectionReason: cashback.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Reject cashback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject cashback",
    });
  }
};

export const getAllCashbacks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const cashbacks = await Cashback.find(query)
      .populate("userId", "name email")
      .populate("orderId", "orderNumber totalAmount")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Cashback.countDocuments(query);

    return res.json({
      success: true,
      cashbacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get cashbacks error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cashbacks",
    });
  }
};

export const getUserCashbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const cashbacks = await Cashback.find({ userId })
      .populate("orderId", "orderNumber totalAmount createdAt")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Cashback.countDocuments({ userId });

    return res.json({
      success: true,
      cashbacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get user cashbacks error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cashback history",
    });
  }
};

export const approveCashback = async (req, res) => {
  try {
    const { cashbackId } = req.params;
    const adminId = req.user.id;

    const cashback = await Cashback.findById(cashbackId)
      .populate("userId", "name email walletbalance")
      .populate("couponId");

    if (!cashback) {
      return res.status(404).json({
        success: false,
        message: "Cashback record not found",
      });
    }

    if (cashback.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cashback is already ${cashback.status}`,
      });
    }
    cashback.status = "approved";
    cashback.approvedBy = adminId;
    cashback.approvedAt = new Date();
    await cashback.save();

    console.log(
      `💰 Cashback approved: ₹${cashback.cashbackAmount} for user ${cashback.userId.email}`
    );

    return res.json({
      success: true,
      message: "Cashback approved successfully",
      cashback: {
        _id: cashback._id,
        cashbackAmount: cashback.cashbackAmount,
        status: cashback.status,
        approvedAt: cashback.approvedAt,
        userId: cashback.userId,
        orderId: cashback.orderId,
      },
      note: "Cashback amount will be credited to user wallet separately",
    });
  } catch (error) {
    console.error("Approve cashback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve cashback",
    });
  }
};

export const creditCashbackToWallet = async (req, res) => {
  try {
    const { cashbackId } = req.params;
    const adminId = req.user.id;

    const cashback = await Cashback.findById(cashbackId).populate(
      "userId",
      "name email walletbalance"
    );

    if (!cashback) {
      return res.status(404).json({
        success: false,
        message: "Cashback record not found",
      });
    }

    if (cashback.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cashback must be approved before crediting",
      });
    }
    const user = await AuthModel.findById(cashback.userId.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    cashback.status = "credited";
    cashback.creditedAt = new Date();
    await cashback.save();

    return res.json({
      success: true,
      message: `Cashback of ₹${cashback.cashbackAmount} credited to user wallet`,
      cashback: {
        _id: cashback._id,
        cashbackAmount: cashback.cashbackAmount,
        status: cashback.status,
        creditedAt: cashback.creditedAt,
      },
    });
  } catch (error) {
    console.error("Credit cashback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to credit cashback",
    });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).select(
      "code name description discountType discountValue minimumOrderAmount coupantype"
    );

    return res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get active coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active coupons",
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};
const calculateDiscountAmount = (coupon, cartTotal) => {
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(coupon.discountValue, cartTotal);
  }

  return Math.round(discountAmount * 100) / 100;
};

import Referral from "../models/referralModel.js";

export const validateCoupon = async (req, res) => {
  try {
    const {
      code,
      cartTotal,
      cartItems = [],
      cartLength,
      totalQuantity,
    } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (coupon) {
      return handleRegularCoupon(coupon, req, res);
    }
    const referral = await Referral.findOne({
      referralCode: code.toUpperCase(),
      isActive: true,
    }).populate("userId", "name email");

    if (referral) {
      return handleReferralCode(referral, userId, cartTotal, res);
    }
    return res.status(404).json({
      success: false,
      message: "Invalid or expired coupon/referral code",
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};

const handleRegularCoupon = async (coupon, req, res) => {
  const { cartTotal, cartItems = [], totalQuantity } = req.body;
  const userId = req.user.id;

  if (
    coupon.totalUsageLimit &&
    coupon.currentUsageCount >= coupon.totalUsageLimit
  ) {
    return res.status(400).json({
      success: false,
      message: "Coupon usage limit reached globally",
    });
  }
  const userUsageCount = await CouponUsage.countDocuments({
    couponCode: coupon.code,
    userId,
  });

  if (userUsageCount >= coupon.perUserLimit) {
    return res.status(400).json({
      success: false,
      message: "You have already used this coupon the maximum allowed times",
    });
  }
  if (cartTotal < coupon.minimumOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount must be ₹${coupon.minimumOrderAmount} to use this coupon.`,
    });
  }
  if (totalQuantity < coupon.minmumOrderQuanitity) {
    return res.status(400).json({
      success: false,
      message: `Minimum ${coupon.minmumOrderQuanitity} items required to use this coupon.`,
    });
  }
  if (!validateCouponApplicability(coupon, cartItems)) {
    return res.status(400).json({
      success: false,
      message: "This coupon does not apply to your cart items",
    });
  }

  const discountAmount = calculateDiscountAmount(coupon, cartTotal);
  const finalAmount =
    coupon.coupantype === "cashback"
      ? cartTotal // No discount applied at checkout for cashback
      : cartTotal - discountAmount; // Normal discount for regular coupons

  return res.json({
    success: true,
    message: "Coupon validated successfully",
    coupon: {
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
      perUserLimit: coupon.perUserLimit,
      remainingUserLimit: coupon.perUserLimit - userUsageCount,
      coupantype: coupon.coupantype,
      isCashback: coupon.coupantype === "cashback",
      maxDiscountAmount: coupon.maxDiscountAmount,
      isReferral: false,
    },
  });
};

const validateCouponApplicability = (coupon, cartItems) => {
  if (
    (!coupon.applicableProducts || coupon.applicableProducts.length === 0) &&
    (!coupon.applicableCategories || coupon.applicableCategories.length === 0)
  ) {
    return true;
  }
  return cartItems.some((item) => {
    const productMatch =
      coupon.applicableProducts && coupon.applicableProducts.length > 0
        ? coupon.applicableProducts.includes(item.productId?.toString())
        : true;

    const categoryMatch =
      coupon.applicableCategories && coupon.applicableCategories.length > 0
        ? coupon.applicableCategories.includes(item.categoryId?.toString())
        : true;

    return productMatch && categoryMatch;
  });
};

export const trackCouponUsage = async (
  couponCode,
  userId,
  orderId,
  discountAmount
) => {
  try {
    await Coupon.findOneAndUpdate(
      { code: couponCode },
      {
        $inc: { currentUsageCount: 1 },
        $set: { lastUsedAt: new Date() },
      }
    );
    await CouponUsage.create({
      couponCode,
      userId,
      orderId,
      discountAmount,
      usedAt: new Date(),
    });

  } catch (error) {
    console.error("Error tracking coupon usage:", error);
  }
};
