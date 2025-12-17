import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    brand: { type: String },

    price: { type: Number, required: true },
    originalPrice: { type: Number }, 
    stock: { type: Number, default: 0 },

    description: { type: String },
    images: [{ type: String }],
    publicIds: [{ type: String }], 
    producttype: {
      type: String,
      enum: ["physical", "digital"],
      default: "physical",
    },
    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        name: { type: String, required: true },
        value: { type: [String], required: true },
        fieldType: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

productSchema.virtual("discountAmount").get(function () {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     slug: { type: String, required: true },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AuthModel",
//       required: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
//     brand: { type: String },

//     price: { type: Number, required: true },
//     stock: { type: Number, default: 0 },

//     description: { type: String },
//     images: [{ type: String }],
//     imageKeys: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     producttype: {
//       type: String,
//       enum: ["physical", "digital"],
//     },
//     attributes: [
//       {
//         attribute: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Attribute",
//           required: true,
//         },
//         name: { type: String, required: true },
//         value: { type: [String], required: true },
//         fieldType: { type: String },
//       },
//     ],

//     status: { type: String, enum: ["active", "inactive"] },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Product", productSchema);
