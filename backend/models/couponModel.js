import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },

    discountType: {
      type: String,
      enum: ["percentage", "fixed", "cashback"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null },

    minimumOrderAmount: { type: Number, default: 0 },
    minmumOrderQuanitity: { type: Number, default: 0 },
    totalUsageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: 1 },
    currentUsageCount: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    coupantype: {
      type: String,
      enum: ["cashback", "discount"],
      default: "discount",
    },

    applicableTo: {
      type: String,
      enum: ["all", "categories", "subcategories", "products"],
      default: "all",
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);

// import mongoose from "mongoose";

// const couponSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true,
//       trim: true,
//     },
//     name: { type: String, required: true },
//     description: { type: String, required: true },

//     discountType: {
//       type: String,
//       enum: ["percentage", "fixed"],
//       required: true,
//     },
//     discountValue: { type: Number, required: true, min: 0 },
//     maxDiscountAmount: { type: Number, default: null },

//     minimumOrderAmount: { type: Number, default: 0 },
//     minmumOrderQuanitity: { type: Number, default: 0 },
//     totalUsageLimit: { type: Number, default: null },
//     perUserLimit: { type: Number, default: 1 },
//     currentUsageCount: { type: Number, default: 0 },

//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     isActive: { type: Boolean, default: true },
//     coupantype: { type: String, enum: ["cashback", "discount"] },

//     applicableTo: {
//       type: String,
//       enum: ["all", "categories", "subcategories", "products"],
//       default: "all",
//     },
//     categories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//       },
//     ],
//     subcategories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Subcategory",
//       },
//     ],

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AuthModel",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Coupon", couponSchema);
