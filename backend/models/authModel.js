import mongoose from "mongoose";

const AuthModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["user", "vendor", "admin", "customer"],
      required: true,
    },
    userStatus: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    walletbalance: {
      type: Number,
      default: 1,
    },
    addresses: [
      {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
        country: { type: String, default: "India" },
        phone: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        addressType: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
      },
    ],
    verificationToken: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AuthModelSchema.index({ verificationExpires: 1 }, { expireAfterSeconds: 0 });

const AuthModel = mongoose.model("AuthModel", AuthModelSchema);
export default AuthModel;
