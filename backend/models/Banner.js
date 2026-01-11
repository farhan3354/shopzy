import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["header", "center", "category", "other"],
      default: "other",
    },
    link: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Banner = new mongoose.model("Banner", bannerSchema);
export default Banner;
