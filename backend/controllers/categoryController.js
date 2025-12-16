import Category from "../models/categoryModel.js";
import slugify from "slugify";
import { uploadToS3banner, deleteFileFromS3 } from "../utils/s3Utils.js";

// Create category with image
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const slug = slugify(name, { lower: true });

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
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

    const category = await Category.create({
      name,
      slug,
      description,
      image: s3Result.url,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categ = await Category.findById(id);
    if (categ.imageKey) {
      await deleteFileFromS3(banner.imageKey);
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get latest categories (limit to 3)
export const getLatestCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(3);

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get latest categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// import Category from "../models/categoryModel.js";
// import slugify from "slugify";

// //  create category
// export const createCategory = async (req, res) => {
//   try {
//     const { name, description } = req.body;

//     if (!name || !description) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and description are required",
//       });
//     }

//     const slug = slugify(name, { lower: true });

//     const existing = await Category.findOne({ slug });
//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         message: "Category with this name already exists",
//       });
//     }

//     const category = await Category.create({
//       name,
//       slug,
//       description,
//     });

//     return res.status(201).json({ success: true, category });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const getCategories = async (req, res) => {
//   try {
//     const categories = await Category.find();

//     if (!categories || categories.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No categories found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       categories,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// // Get single category
// export const getCategoryById = async (req, res) => {
//   try {
//     const { id } = req.params.id;
//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }
//     return res.status(200).json({ success: false.category });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update category
// export const updateCategory = async (req, res) => {
//   try {
//     const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!category)
//       return res.status(404).json({ message: "Category not found" });
//     res.json(category);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Delete category
// export const deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params.id;
//     const category = await Category.findByIdAndDelete(id);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }
//     return res
//       .status(200)
//       .json({ success: false, message: "Category deleted" });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
