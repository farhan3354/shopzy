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
    originalPrice: { type: Number }, // Added originalPrice field
    stock: { type: Number, default: 0 },

    description: { type: String },
    images: [{ type: String }],
    imageKeys: [
      {
        type: String,
        required: true,
      },
    ],
    // Added image visibility control
    imageVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },
    producttype: {
      type: String,
      enum: ["physical", "digital"],
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

    status: { type: String, enum: ["active", "inactive"] },
    
    // Virtual for discount calculation
    discountPercentage: {
      type: Number,
      virtual: true,
      get: function() {
        if (this.originalPrice && this.originalPrice > this.price) {
          return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
        }
        return 0;
      }
    },
    
    discountAmount: {
      type: Number,
      virtual: true,
      get: function() {
        if (this.originalPrice && this.originalPrice > this.price) {
          return this.originalPrice - this.price;
        }
        return 0;
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ imageVisibility: 1 });

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

// // // first 

// // // import mongoose from "mongoose";

// // // const productSchema = new mongoose.Schema(
// // //   {
// // //     name: { type: String, required: true },
// // //     slug: { type: String, required: true },
// // //     userId: {
// // //       type: mongoose.Schema.Types.ObjectId,
// // //       ref: "AuthModel",
// // //       required: true,
// // //     },
// // //     category: {
// // //       type: mongoose.Schema.Types.ObjectId,
// // //       ref: "Category",
// // //       required: true,
// // //     },
// // //     subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
// // //     brand: { type: String },

// // //     price: { type: Number, required: true },
// // //     stock: { type: Number, default: 0 },

// // //     description: { type: String },
// // //     images: [{ type: String }],

// // //     attributes: [
// // //       {
// // //         attribute: {
// // //           type: mongoose.Schema.Types.ObjectId,
// // //           ref: "Attribute",
// // //           required: true,
// // //         },
// // //         name: { type: String, required: true }, // Store attribute name for easy access
// // //         value: { type: String, required: true }, // Store the actual selected value(s)
// // //         fieldType: { type: String }, // Store field type for display purposes
// // //       },
// // //     ],
// // //     status: { type: String, enum: ["active", "inactive"] },
// // //   },
// // //   { timestamps: true }
// // // );

// // // export default mongoose.model("Product", productSchema);
