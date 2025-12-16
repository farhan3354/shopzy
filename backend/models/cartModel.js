import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        selectedAttributes: {
          type: Map,
          of: String,
          default: {},
        },
      },
    ],
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedAt: Date,
    lockSessionId: String,
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);

// priceAtTime: {
//   type: Number,
//   required: true,
// },
