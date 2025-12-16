import mongoose from "mongoose";

const cashbackSchema = new mongoose.Schema(
  {
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
    couponCode: {
      type: String,
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    cashbackAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalOrderAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "credited"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
    },
    approvedAt: {
      type: Date,
    },
    creditedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for better query performance
// cashbackSchema.index({ userId: 1, status: 1 });
// cashbackSchema.index({ orderId: 1 }, { unique: true });
// cashbackSchema.index({ couponId: 1 });
// cashbackSchema.index({ createdAt: 1 });

export default mongoose.model("Cashback", cashbackSchema);
