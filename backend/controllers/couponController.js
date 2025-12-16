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

    // Validate cashback coupon
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

// function validateCouponApplicability(coupon, cartItems) {
//   if (coupon.applicableTo === "all") return true;

//   if (coupon.applicableTo === "categories") {
//     return cartItems.some((item) =>
//       coupon.categories.includes(item.productId?.category)
//     );
//   }

//   if (coupon.applicableTo === "subcategories") {
//     return cartItems.some((item) =>
//       coupon.subcategories.includes(item.productId?.subcategory)
//     );
//   }

//   return false;
// }

// export const validateCoupon = async (req, res) => {
//   try {
//     const {
//       code,
//       cartTotal,
//       cartItems = [],
//       cartLength,
//       totalQuantity,
//     } = req.body;
//     const userId = req.user.id;

//     if (!code) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code is required",
//       });
//     }

//     const coupon = await Coupon.findOne({
//       code: code.toUpperCase(),
//       isActive: true,
//       startDate: { $lte: new Date() },
//       endDate: { $gte: new Date() },
//     });

//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid or expired coupon code",
//       });
//     }

//     // For cashback coupons, ensure they are percentage type
//     if (
//       coupon.coupantype === "cashback" &&
//       coupon.discountType !== "percentage"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid cashback coupon configuration",
//       });
//     }

//     if (
//       coupon.totalUsageLimit &&
//       coupon.currentUsageCount >= coupon.totalUsageLimit
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon usage limit reached globally",
//       });
//     }

//     const userUsageCount = await CouponUsage.countDocuments({
//       couponCode: coupon.code,
//       userId,
//     });

//     if (userUsageCount >= coupon.perUserLimit) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already used this coupon the maximum allowed times",
//       });
//     }

//     // Check minimum order amount
//     if (cartTotal < coupon.minimumOrderAmount) {
//       return res.status(400).json({
//         success: false,
//         message: `Minimum order amount must be ₹${coupon.minimumOrderAmount} to use this coupon.`,
//       });
//     }

//     // Check minimum quantity
//     if (totalQuantity < coupon.minmumOrderQuanitity) {
//       return res.status(400).json({
//         success: false,
//         message: `Minimum ${coupon.minmumOrderQuanitity} items required to use this coupon.`,
//       });
//     }

//     if (!validateCouponApplicability(coupon, cartItems)) {
//       return res.status(400).json({
//         success: false,
//         message: "This coupon does not apply to your cart items",
//       });
//     }

//     const discountAmount = calculateDiscountAmount(coupon, cartTotal);

//     // ✅ FIX: For cashback coupons, final amount doesn't include discount
//     const finalAmount =
//       coupon.coupantype === "cashback"
//         ? cartTotal // No discount applied at checkout for cashback
//         : cartTotal - discountAmount; // Normal discount for regular coupons

//     return res.json({
//       success: true,
//       message: "Coupon validated successfully",
//       coupon: {
//         code: coupon.code,
//         name: coupon.name,
//         description: coupon.description,
//         discountType: coupon.discountType,
//         discountValue: coupon.discountValue,
//         discountAmount,
//         finalAmount,
//         perUserLimit: coupon.perUserLimit,
//         remainingUserLimit: coupon.perUserLimit - userUsageCount,
//         coupantype: coupon.coupantype, // ✅ IMPORTANT: Include coupantype
//         isCashback: coupon.coupantype === "cashback",
//         maxDiscountAmount: coupon.maxDiscountAmount,
//       },
//     });
//   } catch (error) {
//     console.error("Validate coupon error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to validate coupon",
//     });
//   }
// };

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

    // ✅ FIX: Only approve, don't credit yet
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

    // ✅ FIX: Get the user and update wallet balance
    const user = await AuthModel.findById(cashback.userId.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Add cashback amount to user's wallet balance
    const oldBalance = user.walletbalance || 0;
    user.walletbalance = oldBalance + cashback.cashbackAmount;
    await user.save();

    // Update cashback status
    cashback.status = "credited";
    cashback.creditedAt = new Date();
    await cashback.save();

    console.log(
      `💰 Cashback credited: ₹${cashback.cashbackAmount} added to ${user.email}'s wallet. Balance: ₹${oldBalance} → ₹${user.walletbalance}`
    );

    return res.json({
      success: true,
      message: `Cashback of ₹${cashback.cashbackAmount} credited to user wallet`,
      cashback: {
        _id: cashback._id,
        cashbackAmount: cashback.cashbackAmount,
        status: cashback.status,
        creditedAt: cashback.creditedAt,
      },
      walletUpdate: {
        oldBalance: oldBalance,
        newBalance: user.walletbalance,
        addedAmount: cashback.cashbackAmount,
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

// EXISTING FUNCTIONS (keep your existing ones)

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

// Helper function to calculate discount amount
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

    // First check if it's a regular coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (coupon) {
      // Handle regular coupon validation
      return handleRegularCoupon(coupon, req, res);
    }

    // If not a regular coupon, check if it's a referral code
    const referral = await Referral.findOne({
      referralCode: code.toUpperCase(),
      isActive: true,
    }).populate("userId", "name email");

    if (referral) {
      return handleReferralCode(referral, userId, cartTotal, res);
    }

    // If neither coupon nor referral code found
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

  // Check global usage limit
  if (
    coupon.totalUsageLimit &&
    coupon.currentUsageCount >= coupon.totalUsageLimit
  ) {
    return res.status(400).json({
      success: false,
      message: "Coupon usage limit reached globally",
    });
  }

  // Check per user usage limit
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

  // Check minimum order amount
  if (cartTotal < coupon.minimumOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount must be ₹${coupon.minimumOrderAmount} to use this coupon.`,
    });
  }

  // Check minimum quantity
  if (totalQuantity < coupon.minmumOrderQuanitity) {
    return res.status(400).json({
      success: false,
      message: `Minimum ${coupon.minmumOrderQuanitity} items required to use this coupon.`,
    });
  }

  // Validate coupon applicability to cart items
  if (!validateCouponApplicability(coupon, cartItems)) {
    return res.status(400).json({
      success: false,
      message: "This coupon does not apply to your cart items",
    });
  }

  const discountAmount = calculateDiscountAmount(coupon, cartTotal);

  // For cashback coupons, final amount doesn't include discount
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

const handleReferralCode = async (referral, userId, cartTotal, res) => {
  // Check if user is using their own referral code
  if (referral.userId._id.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot use your own referral code",
    });
  }

  // Check if user has already used a referral code in a previous order
  const existingReferralUsage = await Referral.findOne({
    "referredOrders.referredByUserId": userId,
    "referredOrders.rewardStatus": { $in: ["pending", "approved"] },
  });

  if (existingReferralUsage) {
    return res.status(400).json({
      success: false,
      message: "You have already used a referral code in a previous order",
    });
  }

  // For referral codes, we don't apply immediate discount
  // Just validate and track for admin approval after order completion
  return res.json({
    success: true,
    message: `Referral code applied successfully! ${referral.userId.name} will receive rewards after your order is completed.`,
    coupon: {
      code: referral.referralCode,
      name: "Referral Bonus",
      description: `Referral from ${referral.userId.name} - rewards applied after order completion`,
      discountType: "referral",
      discountValue: 0, // No immediate discount
      discountAmount: 0,
      finalAmount: cartTotal, // No change to cart total
      isReferral: true,
      referrerId: referral.userId._id,
      referrerName: referral.userId.name,
    },
  });
};

// Helper function to calculate discount amount
// const calculateDiscountAmount = (coupon, cartTotal) => {
//   let discountAmount = 0;

//   if (coupon.discountType === "percentage") {
//     discountAmount = (cartTotal * coupon.discountValue) / 100;

//     // Apply maximum discount limit if set
//     if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
//       discountAmount = coupon.maxDiscountAmount;
//     }
//   } else if (coupon.discountType === "fixed") {
//     discountAmount = coupon.discountValue;

//     // Ensure discount doesn't exceed cart total
//     if (discountAmount > cartTotal) {
//       discountAmount = cartTotal;
//     }
//   }

//   return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
// };

// Helper function to validate coupon applicability to cart items
const validateCouponApplicability = (coupon, cartItems) => {
  // If no specific products/categories are set, coupon applies to all items
  if (
    (!coupon.applicableProducts || coupon.applicableProducts.length === 0) &&
    (!coupon.applicableCategories || coupon.applicableCategories.length === 0)
  ) {
    return true;
  }

  // Check if any cart item matches the coupon criteria
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
    // Update coupon usage count
    await Coupon.findOneAndUpdate(
      { code: couponCode },
      {
        $inc: { currentUsageCount: 1 },
        $set: { lastUsedAt: new Date() },
      }
    );

    // Record coupon usage
    await CouponUsage.create({
      couponCode,
      userId,
      orderId,
      discountAmount,
      usedAt: new Date(),
    });

    console.log(
      `✅ Coupon usage tracked: ${couponCode} used by user ${userId}`
    );
  } catch (error) {
    console.error("Error tracking coupon usage:", error);
  }
};

// Get all referrals for admin
export const getAllReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { referralCode: { $regex: search, $options: "i" } },
            { "userId.name": { $regex: search, $options: "i" } },
            { "userId.email": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const referrals = await Referral.find(searchQuery)
      .populate("userId", "name email")
      .populate("referredOrders.orderId", "orderNumber totalAmount createdAt")
      .populate("referredOrders.referredByUserId", "name email")
      .populate("referredOrders.approvedBy", "name email")
      .populate("referredOrders.creditedBy", "name email")
      .populate("referredOrders.rejectedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Referral.countDocuments(searchQuery);

    // Calculate stats
    const totalEarnings = referrals.reduce(
      (sum, ref) => sum + ref.totalEarnings,
      0
    );
    const pendingEarnings = referrals.reduce(
      (sum, ref) => sum + ref.pendingEarnings,
      0
    );
    const totalOrders = referrals.reduce(
      (sum, ref) => sum + ref.totalReferralOrders,
      0
    );
    const pendingOrders = referrals.reduce(
      (sum, ref) =>
        sum +
        ref.referredOrders.filter((order) => order.rewardStatus === "pending")
          .length,
      0
    );

    return res.json({
      success: true,
      referrals,
      stats: {
        totalUsers: total,
        totalEarnings,
        pendingEarnings,
        totalOrders,
        pendingOrders,
      },
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get all referrals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referrals",
    });
  }
};

// Approve referral reward
export const approveReferralReward = async (req, res) => {
  try {
    const { referralId, orderIndex } = req.params;
    const adminId = req.user.id;

    const referral = await Referral.findById(referralId).populate(
      "userId",
      "name email"
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral record not found",
      });
    }

    if (orderIndex >= referral.referredOrders.length) {
      return res.status(404).json({
        success: false,
        message: "Referral order not found",
      });
    }

    const order = referral.referredOrders[orderIndex];

    if (order.rewardStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Referral reward is already ${order.rewardStatus}`,
      });
    }

    // Update the order
    referral.referredOrders[orderIndex].rewardStatus = "approved";
    referral.referredOrders[orderIndex].approvedAt = new Date();
    referral.referredOrders[orderIndex].approvedBy = adminId;

    // Calculate earnings - FIXED: Remove await since it's not an async function
    referral.calculateEarnings();
    await referral.save();

    console.log(
      `✅ Referral reward approved: ₹${order.rewardAmount} for ${referral.userId.email}`
    );

    return res.json({
      success: true,
      message: "Referral reward approved successfully",
      referral: {
        _id: referral._id,
        order: referral.referredOrders[orderIndex],
        totalEarnings: referral.totalEarnings,
        pendingEarnings: referral.pendingEarnings,
      },
    });
  } catch (error) {
    console.error("Approve referral reward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve referral reward",
    });
  }
};

export const creditReferralReward = async (req, res) => {
  try {
    const { referralId, orderIndex } = req.params;
    const adminId = req.user.id;

    const referral = await Referral.findById(referralId)
      .populate("userId", "name email walletbalance") // Referrer
      .populate("referredOrders.referredByUserId", "name email walletbalance"); // Referred user

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral record not found",
      });
    }

    if (orderIndex >= referral.referredOrders.length) {
      return res.status(404).json({
        success: false,
        message: "Referral order not found",
      });
    }

    const order = referral.referredOrders[orderIndex];

    if (order.rewardStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Referral reward must be approved before crediting",
      });
    }

    // Get both users
    const referrer = await AuthModel.findById(referral.userId._id); // Person who shared the code
    const referredUser = await AuthModel.findById(order.referredByUserId); // Person who used the code

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: "Referrer user not found",
      });
    }

    if (!referredUser) {
      return res.status(404).json({
        success: false,
        message: "Referred user not found",
      });
    }

    // Calculate split (50% each)
    const totalReward = order.rewardAmount;
    const halfReward = totalReward / 2;

    // Credit referrer (person who shared the code)
    const referrerOldBalance = referrer.walletbalance || 0;
    referrer.walletbalance = referrerOldBalance + halfReward;
    await referrer.save();

    // Credit referred user (person who used the code)
    const referredUserOldBalance = referredUser.walletbalance || 0;
    referredUser.walletbalance = referredUserOldBalance + halfReward;
    await referredUser.save();

    // Update referral order status
    referral.referredOrders[orderIndex].rewardStatus = "paid";
    referral.referredOrders[orderIndex].creditedAt = new Date();
    referral.referredOrders[orderIndex].creditedBy = adminId;

    // Calculate earnings
    referral.calculateEarnings();
    await referral.save();

    console.log(
      `💰 Referral reward split: ₹${totalReward} total\n` +
      `   → Referrer (${referrer.email}): ₹${halfReward} | Balance: ₹${referrerOldBalance} → ₹${referrer.walletbalance}\n` +
      `   → Referred User (${referredUser.email}): ₹${halfReward} | Balance: ₹${referredUserOldBalance} → ₹${referredUser.walletbalance}`
    );

    return res.json({
      success: true,
      message: `Referral reward of ₹${totalReward} split equally between both users (₹${halfReward} each)`,
      referral: {
        _id: referral._id,
        order: referral.referredOrders[orderIndex],
        totalEarnings: referral.totalEarnings,
        pendingEarnings: referral.pendingEarnings,
      },
      walletUpdates: {
        referrer: {
          name: referrer.name,
          email: referrer.email,
          oldBalance: referrerOldBalance,
          newBalance: referrer.walletbalance,
          addedAmount: halfReward,
        },
        referredUser: {
          name: referredUser.name,
          email: referredUser.email,
          oldBalance: referredUserOldBalance,
          newBalance: referredUser.walletbalance,
          addedAmount: halfReward,
        },
        totalReward: totalReward,
        splitAmount: halfReward,
      },
    });
  } catch (error) {
    console.error("Credit referral reward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to credit referral reward",
    });
  }
};

// Reject referral reward
export const rejectReferralReward = async (req, res) => {
  try {
    const { referralId, orderIndex } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const referral = await Referral.findById(referralId).populate(
      "userId",
      "name email"
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral record not found",
      });
    }

    if (orderIndex >= referral.referredOrders.length) {
      return res.status(404).json({
        success: false,
        message: "Referral order not found",
      });
    }

    const order = referral.referredOrders[orderIndex];

    if (order.rewardStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Referral reward is already ${order.rewardStatus}`,
      });
    }

    if (!rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    referral.referredOrders[orderIndex].rewardStatus = "rejected";
    referral.referredOrders[orderIndex].rejectedAt = new Date();
    referral.referredOrders[orderIndex].rejectedBy = adminId;
    referral.referredOrders[orderIndex].rejectionReason = rejectionReason;

    // Calculate earnings - FIXED: Remove await
    referral.calculateEarnings();
    await referral.save();

    console.log(
      `❌ Referral reward rejected: ₹${order.rewardAmount} for ${referral.userId.email}. ` +
        `Reason: ${rejectionReason}`
    );

    return res.json({
      success: true,
      message: "Referral reward rejected successfully",
      referral: {
        _id: referral._id,
        order: referral.referredOrders[orderIndex],
        totalEarnings: referral.totalEarnings,
        pendingEarnings: referral.pendingEarnings,
      },
    });
  } catch (error) {
    console.error("Reject referral reward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject referral reward",
    });
  }
};