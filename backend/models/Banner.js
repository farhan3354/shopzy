import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["header", "category", "center", "other"],
    },
    link: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    imageKey: {
      type: String,
      required: true,
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

export default mongoose.model("Banner", bannerSchema);

// import mongoose from "mongoose";

// const bannerSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ["header", "center", "category", "other"],
//       default: "other",
//     },
//     link: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// const Banner = new mongoose.model("Banner", bannerSchema);
// export default Banner;
