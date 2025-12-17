import Product from "../models/product.js";
import slugify from "slugify";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      brand,
      price,
      originalPrice,
      stock,
      description,
      producttype,
      attributes,
    } = req.body;
    const userId = req?.user.id;

    console.log("🎯 Create Product API Called");
    console.log("📝 Request body:", {
      name,
      category,
      subcategory,
      brand,
      price,
      originalPrice,
      stock,
      producttype,
    });
    console.log("📁 Files received:", req.files?.length || 0);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    // Validation
    if (!name || !category || !subcategory || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Price validation
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;

    if (priceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (originalPriceNum && originalPriceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be greater than 0",
      });
    }

    if (originalPriceNum && originalPriceNum < priceNum) {
      return res.status(400).json({
        success: false,
        message: "Original price cannot be less than selling price",
      });
    }

    // File validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 files allowed",
      });
    }

    // Parse attributes
    let parsedAttributes = [];
    if (attributes) {
      try {
        parsedAttributes = JSON.parse(attributes);
        parsedAttributes = parsedAttributes.map((attr) => {
          let valuesArray = [];
          if (Array.isArray(attr.value)) {
            valuesArray = attr.value;
          } else if (
            typeof attr.value === "string" &&
            attr.value.trim() !== ""
          ) {
            valuesArray = [attr.value];
          }
          return {
            attribute: attr.attribute,
            name: attr.name || "Unknown Attribute",
            value: valuesArray,
            fieldType: attr.fieldType || "dropdown",
          };
        });
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid attributes format",
        });
      }
    }

    // Extract Cloudinary URLs and public IDs from req.files
    // CloudinaryStorage automatically uploads files and provides these properties
    const images = req.files.map(file => file.path); // Cloudinary URL
    const publicIds = req.files.map(file => file.filename); // Cloudinary public_id

    console.log("☁️ Cloudinary URLs:", images);
    console.log("☁️ Cloudinary Public IDs:", publicIds);

    const slug = slugify(name, { lower: true, strict: true });
    const status = "active";

    console.log("💾 Creating product in database...");
    const product = await Product.create({
      name: name.trim(),
      slug,
      userId,
      category,
      subcategory,
      brand: brand?.trim(),
      price: priceNum,
      originalPrice: originalPriceNum,
      stock: parseInt(stock),
      description: description?.trim(),
      attributes: parsedAttributes,
      images,
      publicIds,
      producttype: producttype || "physical",
      status,
    });

    console.log("✅ Product created successfully");

    // Generate thumbnail versions for images
    const thumbnails = images.map(url => {
      // Transform Cloudinary URL for thumbnail
      return url.replace('/upload/', '/upload/w_300,h_300,c_fill/');
    });

    const responseData = {
      ...product.toObject(),
      thumbnails,
      discountPercentage: product.discountPercentage,
      discountAmount: product.discountAmount,
    };

    return res.status(201).json({
      success: true,
      product: responseData,
      message: `Product created successfully with ${images.length} images`,
    });
  } catch (error) {
    console.error("❌ Product creation failed:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Check if it's a Cloudinary error
    if (error.message && error.message.includes('api_key')) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary configuration error. Please check your API credentials.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Update Product Controller for Cloudinary
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log(`✏️ Updating product: ${id}`);
    console.log("📝 Update data:", updateData);
    console.log("📁 Files received:", req.files?.length || 0);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle file updates
    if (req.files && req.files.length > 0) {
      console.log("🔄 New files uploaded, replacing old ones");

      const oldPublicIds = product.publicIds || [];

      try {
        // Extract new Cloudinary URLs and public IDs
        const newImages = req.files.map(file => file.path);
        const newPublicIds = req.files.map(file => {
          if (file.filename) {
            return file.filename;
          }
          const urlParts = file.path.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1) {
            const pathParts = urlParts.slice(uploadIndex + 2);
            const fullPath = pathParts.join('/');
            return fullPath.replace(/\.[^/.]+$/, '');
          }
          return file.originalname;
        });

        updateData.images = newImages;
        updateData.publicIds = newPublicIds;

        // Delete old files from Cloudinary
        if (oldPublicIds.length > 0) {
          console.log(`🗑️ Deleting ${oldPublicIds.length} old files from Cloudinary`);
          // Import cloudinary for deletion
          const cloudinary = (await import('../config/cloudinary.js')).default;
          
          const deletePromises = oldPublicIds.map(publicId => {
            return cloudinary.uploader.destroy(publicId);
          });
          
          await Promise.all(deletePromises);
          console.log("✅ Old files deleted from Cloudinary");
        }

        console.log("✅ New files uploaded to Cloudinary:", newImages.length);
      } catch (uploadError) {
        console.error("❌ Error updating files:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to update files: " + uploadError.message,
        });
      }
    }

    // Handle files to delete (from frontend)
    if (req.body.imagesToDelete) {
      try {
        const imagesToDelete = JSON.parse(req.body.imagesToDelete);
        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          console.log(
            `🗑️ Deleting ${imagesToDelete.length} marked files from Cloudinary`
          );

          // Import cloudinary for deletion
          const cloudinary = (await import('../config/cloudinary.js')).default;

          // Extract public IDs from URLs to delete
          const publicIdsToDelete = imagesToDelete
            .map((url) => {
              const urlParts = url.split('/');
              const uploadIndex = urlParts.indexOf('upload');
              if (uploadIndex !== -1) {
                const pathParts = urlParts.slice(uploadIndex + 2);
                const fullPath = pathParts.join('/');
                return fullPath.replace(/\.[^/.]+$/, '');
              }
              return null;
            })
            .filter((id) => id);

          if (publicIdsToDelete.length > 0) {
            const deletePromises = publicIdsToDelete.map(publicId => {
              return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
            console.log("✅ Marked files deleted from Cloudinary");
          }

          // Update images and publicIds arrays
          if (updateData.images === undefined) {
            updateData.images = product.images.filter(
              (img) => !imagesToDelete.includes(img)
            );
          }
          if (updateData.publicIds === undefined) {
            updateData.publicIds = product.publicIds.filter(
              (publicId) => !publicIdsToDelete.includes(publicId)
            );
          }
        }
      } catch (e) {
        console.error("❌ Error parsing imagesToDelete:", e);
      }
    }

    // Handle attributes
    if (req.body.attributes) {
      try {
        const parsedAttributes = JSON.parse(req.body.attributes);
        updateData.attributes = parsedAttributes;
        console.log("✅ Attributes parsed successfully");
      } catch (e) {
        console.error("❌ Invalid attributes format:", e);
        return res.status(400).json({
          success: false,
          message: "Invalid attributes format",
        });
      }
    }

    // Handle originalPrice validation
    if (
      updateData.originalPrice !== undefined &&
      updateData.price !== undefined
    ) {
      const originalPrice = parseFloat(updateData.originalPrice);
      const price = parseFloat(updateData.price);

      if (originalPrice && price && originalPrice < price) {
        return res.status(400).json({
          success: false,
          message: "Original price cannot be less than selling price",
        });
      }
    }

    // Generate new slug if name changed
    if (req.body.name && req.body.name !== product.name) {
      updateData.slug = slugify(req.body.name, { lower: true, strict: true });
      console.log("🔄 Generated new slug:", updateData.slug);
    }

    // Handle numeric conversions
    if (updateData.price !== undefined)
      updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = updateData.originalPrice
        ? parseFloat(updateData.originalPrice)
        : null;
    }
    if (updateData.stock !== undefined)
      updateData.stock = parseInt(updateData.stock);

    console.log("💾 Updating product in database...");
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found after update",
      });
    }

    // Generate thumbnails
    const thumbnails = updatedProduct.images.map(url => 
      url.replace('/upload/', '/upload/w_300,h_300,c_fill/')
    );

    const responseData = {
      ...updatedProduct.toObject(),
      thumbnails,
      discountPercentage: updatedProduct.discountPercentage,
      discountAmount: updatedProduct.discountAmount,
    };

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: responseData,
    });
  } catch (error) {
    console.error("❌ Update product error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product: " + error.message,
    });
  }
};

// Delete Product Controller
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete files from Cloudinary
    if (product.publicIds && product.publicIds.length > 0) {
      try {
        const cloudinary = (await import('../config/cloudinary.js')).default;
        
        const deletePromises = product.publicIds.map(publicId => {
          return cloudinary.uploader.destroy(publicId);
        });
        
        await Promise.all(deletePromises);
        console.log(`🗑️ Deleted ${product.publicIds.length} files from Cloudinary`);
      } catch (deleteError) {
        console.error("❌ Error deleting files from Cloudinary:", deleteError);
        // Continue with product deletion even if Cloudinary delete fails
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product: " + error.message,
    });
  }
};

// Get product with thumbnails
export const getProductWithThumbnails = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return null;

  const thumbnails = product.images.map(url => 
    url.replace('/upload/', '/upload/w_300,h_300,c_fill/')
  );

  return {
    ...product.toObject(),
    thumbnails,
  };
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: "subcategory",
      select: "name slug parentCategory",
      populate: { path: "parentCategory", select: "name slug" },
    });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;

    const products = await Product.find({ userId }).populate({
      path: "subcategory",
      select: "name slug parentCategory",
      populate: { path: "parentCategory", select: "name slug" },
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("🔥 Server error in getVendorProducts:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate({
      path: "subcategory",
      select: "name slug parentCategory",
      populate: { path: "parentCategory", select: "name slug" },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getcategoryProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const query = {
      status: "active",
      $or: [{ category: id }, { "category._id": id }],
    };

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// change staus
export const statusChange = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product found in the database" });
    }
    const { status } = req.body;
    product.status = status;

    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product status updated to '${product.status}'`,
      product,
    });
  } catch (error) {
    console.error("❌ Error changing product status:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
