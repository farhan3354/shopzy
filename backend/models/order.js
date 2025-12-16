import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
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
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        selectedAttributes: {
          type: Map,
          of: String,
          default: {},
        },
        productName: String,
        productImage: String,
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // ✅ ADD WALLET DETAILS
    walletDetails: {
      usedWallet: {
        type: Boolean,
        default: false,
      },
      walletAmountUsed: {
        type: Number,
        default: 0,
      },
      walletBalanceBefore: {
        type: Number,
        default: 0,
      },
      walletBalanceAfter: {
        type: Number,
        default: 0,
      },
      razorpayAmount: {
        type: Number,
        default: 0,
      },
      remainingAmount: {
        type: Number,
        default: 0,
      },
    },

    appliedCoupon: {
      code: String,
      discountAmount: Number,
      // ✅ ADD COUPON DETAILS FOR BETTER TRACKING
      name: String,
      description: String,
      discountType: String,
      discountValue: Number,
      isReferral: {
        type: Boolean,
        default: false,
      },
      referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuthModel",
      },
      coupantype: String,
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // ✅ ADD ADDITIONAL ORDER FIELDS
    paidAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    failureReason: {
      type: String,
    },

    stockUpdated: {
      type: Boolean,
      default: false,
    },

    webhookReceived: {
      type: Boolean,
      default: false,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const timestamp = date.getTime();
    this.orderNumber = `ORD-${timestamp}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);

// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AuthModel",
//       required: true,
//     },
//     orderNumber: {
//       type: String,
//       unique: true,
//     },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         selectedAttributes: {
//           type: Map,
//           of: String,
//           default: {},
//         },
//         productName: String,
//         productImage: String,
//       },
//     ],

//     subtotal: {
//       type: Number,
//       required: true,
//     },
//     discountAmount: {
//       type: Number,
//       default: 0,
//     },
//     shippingCharges: {
//       type: Number,
//       default: 0,
//     },
//     taxAmount: {
//       type: Number,
//       default: 0,
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },

//     appliedCoupon: {
//       code: String,
//       discountAmount: Number,
//     },

//     shippingAddress: {
//       fullName: { type: String, required: true },
//       email: { type: String },
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       pinCode: { type: String, required: true },
//       country: { type: String, required: true, default: "India" },
//       phone: { type: String, required: true },
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["pending", "completed", "failed", "refunded"],
//       default: "pending",
//     },
//     orderStatus: {
//       type: String,
//       enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },

//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,
//   },
//   { timestamps: true }
// );

// orderSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const date = new Date();
//     const timestamp = date.getTime();
//     this.orderNumber = `ORD-${timestamp}`;
//   }
//   next();
// });

// export default mongoose.model("Order", orderSchema);
