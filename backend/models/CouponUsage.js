import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      ref: "Coupon",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    discountAmount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },

    couponDetails: {
      discountType: String,
      discountValue: Number,
      maxDiscountAmount: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CouponUsage", couponUsageSchema);
