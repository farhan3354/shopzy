import AuthModel from "../models/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, emailTemplates } from "../config/email.js";
import Referal from "../models/referralModel.js";

// export const registerForm = async (req, res) => {
//   try {
//     const { name, email, phone, password, userRole } = req.body;

//     if (!name || !email || !phone || !password || !userRole) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid email address",
//       });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 6 characters long",
//       });
//     }

//     const existingUser = await AuthModel.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "User already exists with this email",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     const newUser = await AuthModel.create({
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       phone: phone.trim(),
//       password: hashedPassword,
//       userRole,
//       userStatus: "pending",
//       walletbalance: 0,
//       verificationToken,
//       verificationExpires,
//     });

//     const verificationUrl = `http://localhost:5173/verify-account/${verificationToken}`;
//     try {
//       const emailHtml = emailTemplates.verificationEmail(
//         newUser.name,
//         verificationUrl
//       );

//       await sendEmail(
//         newUser.email,
//         "Verify Your Account - Action Required",
//         emailHtml
//       );

//       console.log(`✅ Verification email sent to: ${newUser.email}`);
//     } catch (emailError) {
//       console.error("❌ Failed to send verification email:", emailError);
//     }

//     return res.status(201).json({
//       success: true,
//       message:
//         "Registration successful! Please check your email to verify your account.",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         phone: newUser.phone,
//         userRole: newUser.userRole,
//         userStatus: newUser.userStatus,
//       },
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "User already exists with this email",
//       });
//     }

//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: errors,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error during registration",
//     });
//   }
// };

export const registerForm = async (req, res) => {
  try {
    const { name, email, phone, password, userRole } = req.body;

    if (!name || !email || !phone || !password || !userRole) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await AuthModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      userRole,
      userStatus: "pending",
      walletbalance: 0,
      verificationToken,
      verificationExpires,
    });

    const referralCode = await Referal.generateReferralCode();
    await Referal.create({
      userId: newUser._id,
      referralCode: referralCode,
    });

    console.log(
      `✅ Referral code generated for ${newUser.email}: ${referralCode}`
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-account/${verificationToken}`;
    try {
      const emailHtml = emailTemplates.verificationEmail(
        newUser.name,
        verificationUrl
      );

      await sendEmail(
        newUser.email,
        "Verify Your Account - Action Required",
        emailHtml
      );

      console.log(`✅ Verification email sent to: ${newUser.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        userRole: newUser.userRole,
        userStatus: newUser.userStatus,
        referralCode: referralCode,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await AuthModel.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      const expiredUser = await AuthModel.findOne({ verificationToken: token });

      if (expiredUser) {
        return res.status(400).json({
          success: false,
          message: "Verification link has expired. Please request a new one.",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid verification link",
        code: "INVALID_TOKEN",
      });
    }

    if (user.userStatus === "active") {
      return res.status(200).json({
        success: true,
        message: "Account is already verified",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userRole: user.userRole,
        },
      });
    }

    user.userStatus = "active";
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    try {
      const loginUrl = process.env.CLIENT_URL;
      const welcomeHtml = emailTemplates.welcomeEmail(user.name, loginUrl);

      await sendEmail(
        user.email,
        "Account Verified Successfully!",
        welcomeHtml
      );

      console.log(`✅ Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
    }

    console.log(`✅ Account verified for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully! You can now log in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userRole: user.userRole,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await AuthModel.findOne({
      email: email.toLowerCase().trim(),
      userStatus: "pending",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No pending registration found with this email or account is already verified",
      });
    }

    if (user.verificationExpires && user.verificationExpires > new Date()) {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-account/${user.verificationToken}`;
      const emailHtml = emailTemplates.verificationEmail(
        user.name,
        verificationUrl
      );

      await sendEmail(user.email, "Verify Your Account - Reminder", emailHtml);
    } else {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.verificationToken = verificationToken;
      user.verificationExpires = verificationExpires;
      await user.save();

      const verificationUrl = `${process.env.CLIENT_URL}/verify-account/${verificationToken}`;
      const emailHtml = emailTemplates.verificationEmail(
        user.name,
        verificationUrl
      );

      await sendEmail(user.email, "Verify Your Account - New Link", emailHtml);
    }

    console.log(`✅ Verification email resent to: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending verification email",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await AuthModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.userStatus === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your email for the verification link.",
        needsVerification: true,
      });
    }

    if (user.userStatus === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.userRole,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userRole: user.userRole,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.user.id).select(
      "-password -verificationToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const cleanupExpiredVerifications = async () => {
  try {
    const result = await AuthModel.deleteMany({
      userStatus: "pending",
      verificationExpires: { $lt: new Date() },
    });

    console.log(
      `🧹 Cleaned up ${result.deletedCount} expired verification records`
    );
    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup Error:", error);
    throw error;
  }
};

export const getcustomer = async (req, res) => {
  const customer = await AuthModel.find();

  if (!customer && customer.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No data in the database" });
  }
  return res.status(200).json({ success: true, customer });
};

// change user
export const changeCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await AuthModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.userStatus = status;
    const updatedUser = await user.save();

    return res.json({ success: true, customer: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await AuthModel.findById(userId).select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// Add new address
export const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const newAddress = req.body;

    // Validate required fields
    const required = [
      "fullName",
      "address",
      "city",
      "state",
      "pinCode",
      "phone",
    ];
    const isValid = required.every((field) => newAddress[field]?.trim());

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields",
      });
    }

    const user = await AuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If this is the first address, set it as default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // Add the new address
    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.body;

    const user = await AuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Reset all addresses to non-default
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });

    // Set the selected address as default
    const address = user.addresses.id(addressId);
    if (address) {
      address.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};

// import AuthModel from "../models/authModel.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// export const registerForm = async (req, res) => {
//   try {
//     const { name, email, phone, password, userRole } = req.body;

//     if (!name || !email || !phone || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields are required" });
//     }

//     const existingUser = await AuthModel.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await AuthModel.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       userRole,
//       userStatus: "active",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Registration successful!",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         phone: newUser.phone,
//         userRole: newUser.userRole,
//       },
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // LOGIN USER
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and password are required" });
//     }

//     const user = await AuthModel.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     if (user.userStatus === "blocked") {
//       return res
//         .status(403)
//         .json({ success: false, message: "User is blocked by admin" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.userRole },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         userRole: user.userRole,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
