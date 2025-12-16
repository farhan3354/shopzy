import Banner from "../models/Banner.js";
import { uploadToS3banner, deleteFileFromS3 } from "../utils/s3Utils.js";

export const createBanner = async (req, res) => {
  console.log("🎯 Create Banner API Called");

  try {
    const { name, type, link, description } = req.body;

    console.log("📝 Request body:", { name, type, link, description });
    console.log(
      "📁 File received:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );

    // Validation
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    if (!name || !type || !description) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Name, type, and description are required fields",
      });
    }

    // Upload to S3
    console.log("🚀 Starting S3 upload process...");
    let s3Result;
    try {
      s3Result = await uploadToS3banner(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      console.log("✅ S3 upload completed:", s3Result);
    } catch (uploadError) {
      console.error("❌ S3 upload failed:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image: " + uploadError.message,
      });
    }

    // Create banner in database
    console.log("💾 Creating banner in database...");
    const banner = await Banner.create({
      name,
      description,
      type,
      link: link || "",
      image: s3Result.url,
      imageKey: s3Result.key,
    });

    console.log("✅ Banner created successfully");

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("❌ Create banner error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Banner with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${banners.length} banners`);

    return res.status(200).json({
      success: true,
      data: banners || [],
    });
  } catch (error) {
    console.error("Get banners error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting banner: ${id}`);

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete image from S3
    if (banner.imageKey) {
      await deleteFileFromS3(banner.imageKey);
    }

    // Delete from database
    await Banner.findByIdAndDelete(id);

    console.log("✅ Banner deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete banner",
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, link, description } = req.body;

    console.log(`✏️ Updating banner: ${id}`);

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let updateData = { name, type, link, description };
    let oldImageKey = null;

    // If new image is uploaded
    if (req.file) {
      console.log("🔄 New image uploaded, replacing old one");
      oldImageKey = banner.imageKey;

      // Upload new image
      const s3Result = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      updateData.image = s3Result.url;
      updateData.imageKey = s3Result.key;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Delete old image if replaced
    if (oldImageKey) {
      await deleteFileFromS3(oldImageKey);
    }

    return res.json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update banner",
    });
  }
};

// Get banner by ID
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Get banner by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
    });
  }
};

// Toggle banner status
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner ${
        banner.isActive ? "activated" : "deactivated"
      } successfully`,
      data: banner,
    });
  } catch (error) {
    console.error("Toggle banner status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle banner status",
    });
  }
};

// import Banner from "../models/Banner.js";

// export const createBanner = async (req, res) => {
//   try {
//     const { name, type, link, description } = req.body;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Banner image is required",
//       });
//     }

//     if (!name || !type || !description) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, type, and description are required fields",
//       });
//     }
//     if (!req.file.path) {
//       return res.status(400).json({
//         success: false,
//         message: "File upload failed - no path returned",
//       });
//     }

//     const imageUrl = req.file.path;

//     const banner = await Banner.create({
//       name,
//       description,
//       type,
//       link: link || "",
//       image: imageUrl,
//     });

//     console.log("Banner created successfully:", banner);

//     return res.status(201).json({
//       success: true,
//       message: "Banner created successfully",
//       data: banner,
//     });
//   } catch (error) {
//     console.error("Create banner error details:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error: " + error.message,
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Banner with this name already exists",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error: " + error.message,
//     });
//   }
// };

// // Get all banners

// export const getBanners = async (req, res) => {
//   try {
//     const banners = await Banner.find().sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       data: banners || [],
//     });
//   } catch (error) {
//     console.error("Get banners error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Delete banner
// export const deleteBanner = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedBanner = await Banner.findByIdAndDelete(id);

//     if (!deletedBanner) {
//       return res.status(404).json({
//         success: false,
//         message: "Banner not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Banner deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete banner error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
