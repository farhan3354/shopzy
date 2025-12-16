import Product from "../models/product.js";
import slugify from "slugify";
import {
  uploadProductFiles,
  deleteMultipleFromS3,
  refreshSignedUrls,
} from "../utils/s3Utils.js";

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
      imageVisibility = "public",
      uploadType = "images", // New field from frontend
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
      imageVisibility,
      uploadType,
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

    // Image visibility validation
    if (!["public", "private"].includes(imageVisibility)) {
      return res.status(400).json({
        success: false,
        message: "Image visibility must be either 'public' or 'private'",
      });
    }

    // Upload type validation
    if (!["images", "files"].includes(uploadType)) {
      return res.status(400).json({
        success: false,
        message: "Upload type must be either 'images' or 'files'",
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

    // File validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: `At least one ${uploadType === "images" ? "image" : "file"} is required`,
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 files allowed",
      });
    }

    // Upload files to S3 with visibility control
    console.log("🚀 Starting S3 upload for product files...");
    let s3Results;
    try {
      s3Results = await uploadProductFiles(req.files, imageVisibility, uploadType);
      console.log("✅ Product files uploaded to S3:", s3Results.length);
    } catch (uploadError) {
      console.error("❌ S3 upload failed:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload files: " + uploadError.message,
      });
    }

    const images = s3Results.map((result) => result.url);
    const imageKeys = s3Results.map((result) => result.key);

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
      imageKeys,
      imageVisibility,
      uploadType, // Store upload type
      producttype: producttype || "physical",
      status,
    });

    console.log("✅ Product created successfully");

    // Prepare response data
    let responseData = {
      ...product.toObject(),
      discountPercentage: product.discountPercentage,
      discountAmount: product.discountAmount,
    };

    // Generate signed URLs if files are private
    if (imageVisibility === "private") {
      try {
        console.log("🔄 Generating signed URLs for private files...");
        const accessibleImages = await refreshSignedUrls(product);
        responseData.images = accessibleImages;
        console.log("✅ Signed URLs generated successfully");
      } catch (signedUrlError) {
        console.error("❌ Error generating signed URLs:", signedUrlError);
        // Continue with original URLs if signed URL generation fails
        console.log(
          "⚠️ Using original URLs due to signed URL generation failure"
        );
        // The images array already contains the original URLs
      }
    }

    return res.status(201).json({
      success: true,
      product: responseData,
      message: `Product created successfully with ${images.length} ${imageVisibility} ${uploadType}`,
      imageVisibility,
      uploadType,
    });
  } catch (error) {
    console.error("❌ Product creation failed:", error);
    // Cleanup uploaded files if product creation fails
    if (req.files && req.files.length > 0) {
      try {
        console.log("🧹 Cleaning up uploaded files due to error...");
        // If you have uploaded keys, you can implement cleanup here
      } catch (cleanupError) {
        console.error("❌ Error during cleanup:", cleanupError);
      }
    }

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
      message: "Internal server error: " + error.message,
    });
  }
};

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

      const oldImageKeys = product.imageKeys || [];
      const imageVisibility =
        updateData.imageVisibility || product.imageVisibility;
      const uploadType = updateData.uploadType || product.uploadType || "images";

      try {
        // Upload new files with visibility
        const s3Results = await uploadProductFiles(req.files, imageVisibility, uploadType);
        console.log("✅ New files uploaded to S3:", s3Results.length);

        updateData.images = s3Results.map((result) => result.url);
        updateData.imageKeys = s3Results.map((result) => result.key);
        updateData.uploadType = uploadType;

        // Delete old files from S3
        if (oldImageKeys.length > 0) {
          console.log(`🗑️ Deleting ${oldImageKeys.length} old files from S3`);
          await deleteMultipleFromS3(oldImageKeys);
        }
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
            `🗑️ Deleting ${imagesToDelete.length} marked files from S3`
          );

          // Extract keys from URLs
          const keysToDelete = imagesToDelete
            .map((url) => {
              if (url.includes("amazonaws.com/")) {
                const urlParts = url.split(".amazonaws.com/");
                return urlParts[1];
              }
              return url;
            })
            .filter((key) => key);

          if (keysToDelete.length > 0) {
            await deleteMultipleFromS3(keysToDelete);
          }

          // Update images and imageKeys arrays
          if (updateData.images === undefined) {
            updateData.images = product.images.filter(
              (img) => !imagesToDelete.includes(img)
            );
          }
          if (updateData.imageKeys === undefined) {
            updateData.imageKeys = product.imageKeys.filter(
              (key) =>
                !keysToDelete.some((deletedKey) => key.includes(deletedKey))
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

    // Refresh URLs if files are private
    let accessibleImages = updatedProduct.images;
    if (updatedProduct.imageVisibility === "private") {
      try {
        console.log("🔄 Generating signed URLs for private files...");
        accessibleImages = await refreshSignedUrls(updatedProduct);
        console.log("✅ Signed URLs generated successfully");
      } catch (signedUrlError) {
        console.error("❌ Error generating signed URLs:", signedUrlError);
        // Continue with original URLs as fallback
        console.log(
          "⚠️ Using original URLs due to signed URL generation failure"
        );
      }
    }

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updatedProduct.toObject(),
        images: accessibleImages,
        discountPercentage: updatedProduct.discountPercentage,
        discountAmount: updatedProduct.discountAmount,
      },
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

// import Product from "../models/product.js";
// import slugify from "slugify";
// import {
//   uploadProductImages,
//   deleteMultipleFromS3,
//   refreshSignedUrls,
// } from "../utils/s3Utils.js";

// export const createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       category,
//       subcategory,
//       brand,
//       price,
//       originalPrice,
//       stock,
//       description,
//       producttype,
//       attributes,
//       imageVisibility = "public",
//     } = req.body;
//     const userId = req?.user.id;

//     console.log("🎯 Create Product API Called");
//     console.log("📝 Request body:", {
//       name,
//       category,
//       subcategory,
//       brand,
//       price,
//       originalPrice,
//       stock,
//       producttype,
//       imageVisibility,
//     });
//     console.log("📁 Files received:", req.files?.length || 0);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: user not found",
//       });
//     }

//     // Validation
//     if (!name || !category || !subcategory || !price || !stock) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be filled",
//       });
//     }

//     // Price validation
//     const priceNum = parseFloat(price);
//     const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;

//     if (priceNum <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Price must be greater than 0",
//       });
//     }

//     if (originalPriceNum && originalPriceNum <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Original price must be greater than 0",
//       });
//     }

//     if (originalPriceNum && originalPriceNum < priceNum) {
//       return res.status(400).json({
//         success: false,
//         message: "Original price cannot be less than selling price",
//       });
//     }

//     // Image visibility validation
//     if (!["public", "private"].includes(imageVisibility)) {
//       return res.status(400).json({
//         success: false,
//         message: "Image visibility must be either 'public' or 'private'",
//       });
//     }

//     // Parse attributes
//     let parsedAttributes = [];
//     if (attributes) {
//       try {
//         parsedAttributes = JSON.parse(attributes);
//         parsedAttributes = parsedAttributes.map((attr) => {
//           let valuesArray = [];
//           if (Array.isArray(attr.value)) {
//             valuesArray = attr.value;
//           } else if (
//             typeof attr.value === "string" &&
//             attr.value.trim() !== ""
//           ) {
//             valuesArray = [attr.value];
//           }
//           return {
//             attribute: attr.attribute,
//             name: attr.name || "Unknown Attribute",
//             value: valuesArray,
//             fieldType: attr.fieldType || "dropdown",
//           };
//         });
//       } catch (e) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid attributes format",
//         });
//       }
//     }

//     // Image validation
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one image is required",
//       });
//     }

//     if (req.files.length > 5) {
//       return res.status(400).json({
//         success: false,
//         message: "Maximum 5 images allowed",
//       });
//     }

//     // Upload images to S3 with visibility control
//     console.log("🚀 Starting S3 upload for product images...");
//     let s3Results;
//     try {
//       s3Results = await uploadProductImages(req.files, imageVisibility);
//       console.log("✅ Product images uploaded to S3:", s3Results.length);
//     } catch (uploadError) {
//       console.error("❌ S3 upload failed:", uploadError);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to upload images: " + uploadError.message,
//       });
//     }

//     const images = s3Results.map((result) => result.url);
//     const imageKeys = s3Results.map((result) => result.key);

//     const slug = slugify(name, { lower: true, strict: true });
//     const status = "active";

//     console.log("💾 Creating product in database...");
//     const product = await Product.create({
//       name: name.trim(),
//       slug,
//       userId,
//       category,
//       subcategory,
//       brand: brand?.trim(),
//       price: priceNum,
//       originalPrice: originalPriceNum,
//       stock: parseInt(stock),
//       description: description?.trim(),
//       attributes: parsedAttributes,
//       images,
//       imageKeys,
//       imageVisibility,
//       producttype: producttype || "physical",
//       status,
//     });

//     console.log("✅ Product created successfully");

//     // Prepare response data
//     let responseData = {
//       ...product.toObject(),
//       discountPercentage: product.discountPercentage,
//       discountAmount: product.discountAmount,
//     };

//     // Generate signed URLs if images are private
//     if (imageVisibility === "private") {
//       try {
//         console.log("🔄 Generating signed URLs for private images...");
//         const accessibleImages = await refreshSignedUrls(product);
//         responseData.images = accessibleImages;
//         console.log("✅ Signed URLs generated successfully");
//       } catch (signedUrlError) {
//         console.error("❌ Error generating signed URLs:", signedUrlError);
//         // Continue with original URLs if signed URL generation fails
//         console.log(
//           "⚠️ Using original URLs due to signed URL generation failure"
//         );
//         // The images array already contains the original URLs
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       product: responseData,
//       message: `Product created successfully with ${images.length} ${imageVisibility} images`,
//       imageVisibility,
//     });
//   } catch (error) {
//     console.error("❌ Product creation failed:", error);
//     // Cleanup uploaded files if product creation fails
//     if (req.files && req.files.length > 0) {
//       try {
//         console.log("🧹 Cleaning up uploaded files due to error...");
//         // If you have uploaded keys, you can implement cleanup here
//       } catch (cleanupError) {
//         console.error("❌ Error during cleanup:", cleanupError);
//       }
//     }

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error: " + messages.join(", "),
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Product with this name already exists",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error: " + error.message,
//     });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     console.log(`✏️ Updating product: ${id}`);
//     console.log("📝 Update data:", updateData);
//     console.log("📁 Files received:", req.files?.length || 0);

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // Handle image updates
//     if (req.files && req.files.length > 0) {
//       console.log("🔄 New images uploaded, replacing old ones");

//       const oldImageKeys = product.imageKeys || [];
//       const imageVisibility =
//         updateData.imageVisibility || product.imageVisibility;

//       try {
//         // Upload new images with visibility
//         const s3Results = await uploadProductImages(req.files, imageVisibility);
//         console.log("✅ New images uploaded to S3:", s3Results.length);

//         updateData.images = s3Results.map((result) => result.url);
//         updateData.imageKeys = s3Results.map((result) => result.key);

//         // Delete old images from S3
//         if (oldImageKeys.length > 0) {
//           console.log(`🗑️ Deleting ${oldImageKeys.length} old images from S3`);
//           await deleteMultipleFromS3(oldImageKeys);
//         }
//       } catch (uploadError) {
//         console.error("❌ Error updating images:", uploadError);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to update images: " + uploadError.message,
//         });
//       }
//     }

//     // Handle images to delete (from frontend)
//     if (req.body.imagesToDelete) {
//       try {
//         const imagesToDelete = JSON.parse(req.body.imagesToDelete);
//         if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
//           console.log(
//             `🗑️ Deleting ${imagesToDelete.length} marked images from S3`
//           );

//           // Extract keys from URLs
//           const keysToDelete = imagesToDelete
//             .map((url) => {
//               if (url.includes("amazonaws.com/")) {
//                 const urlParts = url.split(".amazonaws.com/");
//                 return urlParts[1];
//               }
//               return url;
//             })
//             .filter((key) => key);

//           if (keysToDelete.length > 0) {
//             await deleteMultipleFromS3(keysToDelete);
//           }

//           // Update images and imageKeys arrays
//           if (updateData.images === undefined) {
//             updateData.images = product.images.filter(
//               (img) => !imagesToDelete.includes(img)
//             );
//           }
//           if (updateData.imageKeys === undefined) {
//             updateData.imageKeys = product.imageKeys.filter(
//               (key) =>
//                 !keysToDelete.some((deletedKey) => key.includes(deletedKey))
//             );
//           }
//         }
//       } catch (e) {
//         console.error("❌ Error parsing imagesToDelete:", e);
//       }
//     }

//     // Handle attributes
//     if (req.body.attributes) {
//       try {
//         const parsedAttributes = JSON.parse(req.body.attributes);
//         updateData.attributes = parsedAttributes;
//         console.log("✅ Attributes parsed successfully");
//       } catch (e) {
//         console.error("❌ Invalid attributes format:", e);
//         return res.status(400).json({
//           success: false,
//           message: "Invalid attributes format",
//         });
//       }
//     }

//     // Handle originalPrice validation
//     if (
//       updateData.originalPrice !== undefined &&
//       updateData.price !== undefined
//     ) {
//       const originalPrice = parseFloat(updateData.originalPrice);
//       const price = parseFloat(updateData.price);

//       if (originalPrice && price && originalPrice < price) {
//         return res.status(400).json({
//           success: false,
//           message: "Original price cannot be less than selling price",
//         });
//       }
//     }

//     // Generate new slug if name changed
//     if (req.body.name && req.body.name !== product.name) {
//       updateData.slug = slugify(req.body.name, { lower: true, strict: true });
//       console.log("🔄 Generated new slug:", updateData.slug);
//     }

//     // Handle numeric conversions
//     if (updateData.price !== undefined)
//       updateData.price = parseFloat(updateData.price);
//     if (updateData.originalPrice !== undefined) {
//       updateData.originalPrice = updateData.originalPrice
//         ? parseFloat(updateData.originalPrice)
//         : null;
//     }
//     if (updateData.stock !== undefined)
//       updateData.stock = parseInt(updateData.stock);

//     console.log("💾 Updating product in database...");
//     const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found after update",
//       });
//     }

//     // Refresh URLs if images are private
//     let accessibleImages = updatedProduct.images;
//     if (updatedProduct.imageVisibility === "private") {
//       try {
//         console.log("🔄 Generating signed URLs for private images...");
//         accessibleImages = await refreshSignedUrls(updatedProduct);
//         console.log("✅ Signed URLs generated successfully");
//       } catch (signedUrlError) {
//         console.error("❌ Error generating signed URLs:", signedUrlError);
//         // Continue with original URLs as fallback
//         console.log(
//           "⚠️ Using original URLs due to signed URL generation failure"
//         );
//       }
//     }

//     return res.json({
//       success: true,
//       message: "Product updated successfully",
//       product: {
//         ...updatedProduct.toObject(),
//         images: accessibleImages,
//         discountPercentage: updatedProduct.discountPercentage,
//         discountAmount: updatedProduct.discountAmount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Update product error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error: " + messages.join(", "),
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Product with this name already exists",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update product: " + error.message,
//     });
//   }
// };

// Helper function to get product with proper image URLs

export const getProductWithAccessibleImages = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return null;

  let accessibleImages = product.images;
  if (product.imageVisibility === "private") {
    accessibleImages = await refreshSignedUrls(product);
  }

  return {
    ...product.toObject(),
    images: accessibleImages,
  };
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product: ${id}`);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.imageKeys && product.imageKeys.length > 0) {
      await deleteMultipleFromS3(product.imageKeys);
    }

    await Product.findByIdAndDelete(id);

    console.log("✅ Product deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

//  Get all products (with subcategory + category info)
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
