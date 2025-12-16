import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    referredOrders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: true,
        },
        referredByUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AuthModel",
          required: true,
        },
        orderAmount: {
          type: Number,
          required: true,
        },
        rewardAmount: {
          type: Number,
          default: 0,
        },
        rewardStatus: {
          type: String,
          enum: ["pending", "approved", "rejected", "paid"],
          default: "pending",
        },
        referredAt: {
          type: Date,
          default: Date.now,
        },
        approvedAt: Date,
        approvedBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "AuthModel" 
        },
        creditedAt: Date,
        creditedBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "AuthModel" 
        },
        rejectedAt: Date,
        rejectedBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "AuthModel" 
        },
        rejectionReason: String
      },
    ],
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingEarnings: {
      type: Number,
      default: 0,
    },
    totalReferralOrders: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.methods.calculateEarnings = function() {
  this.totalEarnings = this.referredOrders
    .filter(order => order.rewardStatus === "paid")
    .reduce((sum, order) => sum + order.rewardAmount, 0);

  this.pendingEarnings = this.referredOrders
    .filter(order => order.rewardStatus === "pending" || order.rewardStatus === "approved")
    .reduce((sum, order) => sum + order.rewardAmount, 0);

  this.totalReferralOrders = this.referredOrders.length;
  
  return this;
};

referralSchema.statics.generateReferralCode = async function () {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existing = await this.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;


// import mongoose from "mongoose";

// const referralSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AuthModel",
//       required: true,
//       unique: true,
//     },
//     referralCode: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true,
//     },
//     referredOrders: [
//       {
//         orderId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Order",
//           required: true,
//         },
//         referredByUserId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "AuthModel",
//           required: true,
//         },
//         orderAmount: {
//           type: Number,
//           required: true,
//         },
//         rewardAmount: {
//           type: Number,
//           default: 0,
//         },
//         rewardStatus: {
//           type: String,
//           enum: ["pending", "approved", "rejected", "paid"],
//           default: "pending",
//         },
//         referredAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     totalEarnings: {
//       type: Number,
//       default: 0,
//     },
//     pendingEarnings: {
//       type: Number,
//       default: 0,
//     },
//     totalReferralOrders: {
//       type: Number,
//       default: 0,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// referralSchema.statics.generateReferralCode = async function () {
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let code;
//   let isUnique = false;

//   while (!isUnique) {
//     code = "";
//     for (let i = 0; i < 8; i++) {
//       code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }

//     const existing = await this.findOne({ referralCode: code });
//     if (!existing) {
//       isUnique = true;
//     }
//   }

//   return code;
// };

// const Referral = mongoose.model("Referral", referralSchema);
// export default Referral;
