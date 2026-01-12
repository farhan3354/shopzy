import Coupon from "../models/couponModel.js";
import CouponUsage from "../models/CouponUsage.js";
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





