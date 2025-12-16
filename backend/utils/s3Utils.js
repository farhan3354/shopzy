// import { s3Client, BUCKET_NAME } from "../config/s3Config.js";
// import {
//   DeleteObjectCommand,
//   PutObjectCommand,
//   HeadObjectCommand,
//   GetObjectCommand,
//   CopyObjectCommand,
//   ListObjectsV2Command,
//   ListBucketsCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // Upload single file to S3
// export const uploadToS3 = async (
//   fileBuffer,
//   fileName,
//   mimetype,
//   folder = "products"
// ) => {
//   try {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
//     const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

//     const command = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: fileBuffer,
//       ContentType: mimetype,
//       // ACL removed - bucket doesn't allow ACLs
//     });

//     await s3Client.send(command);

//     const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//     console.log(`✅ File uploaded to S3: ${url}`);
//     return { url, key };
//   } catch (error) {
//     console.error("❌ Error uploading to S3:", error);
//     throw error;
//   }
// };

// export const uploadToS3banner = async (
//   fileBuffer,
//   fileName,
//   mimetype,
//   folder = "banners"
// ) => {
//   try {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const key = `${folder}/${uniqueSuffix}-${fileName}`;

//     const command = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: fileBuffer,
//       ContentType: mimetype,
//       // ACL: 'public-read' // Remove this if your bucket doesn't allow public ACLs
//     });

//     await s3Client.send(command);

//     const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//     console.log(`✅ File uploaded to S3: ${url}`);
//     return { url, key };
//   } catch (error) {
//     console.error("❌ Error uploading to S3:", error);
//     throw error;
//   }
// };

// // Upload multiple files
// export const uploadMultipleToS3 = async (files, folder = "products") => {
//   try {
//     console.log(`📤 Starting multiple S3 upload for ${files.length} files to ${folder}...`);

//     const uploadPromises = files.map(async (file) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
//       const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

//       const command = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: key,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         // ACL removed - bucket doesn't allow ACLs
//       });

//       await s3Client.send(command);

//       const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//       console.log(`✅ File uploaded to S3: ${url}`);
//       return { url, key };
//     });

//     const results = await Promise.all(uploadPromises);
//     console.log(`✅ All ${files.length} files uploaded successfully`);

//     return results;
//   } catch (error) {
//     console.error("❌ Multiple S3 Upload Error:", error);
//     throw new Error(`Multiple S3 upload failed: ${error.message}`);
//   }
// };

// // Specialized function for product images with organized folder structure
// export const uploadProductImages = async (files, imageVisibility = "public") => {
//   const folder = imageVisibility === "public" ? "products/public" : "products/private";

//   console.log(`🖼️ Uploading ${files.length} product images to ${folder} (${imageVisibility})`);
//   return await uploadMultipleToS3(files, folder);
// };

// // Generate signed URL for private images
// export const generateSignedUrl = async (key, expiresIn = 3600) => {
//   try {
//     const command = new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     });

//     const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
//     console.log(`✅ Generated signed URL for: ${key} (expires in ${expiresIn}s)`);
//     return signedUrl;
//   } catch (error) {
//     console.error("❌ Error generating signed URL:", error);
//     throw error;
//   }
// };

// // Get accessible URL based on visibility
// export const getAccessibleUrl = async (key, imageVisibility = "public") => {
//   try {
//     if (imageVisibility === "public") {
//       const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//       console.log(`🔗 Using public URL: ${publicUrl}`);
//       return publicUrl;
//     } else {
//       console.log(`🔒 Generating signed URL for private file: ${key}`);
//       const signedUrl = await generateSignedUrl(key);
//       return signedUrl;
//     }
//   } catch (error) {
//     console.error("❌ Error getting accessible URL:", error);
//     throw error;
//   }
// };

// // Refresh signed URLs for a product
// export const refreshSignedUrls = async (product) => {
//   try {
//     if (!product || !product.imageKeys || !Array.isArray(product.imageKeys)) {
//       console.log("⚠️ No image keys found for product");
//       return product.images || [];
//     }

//     if (product.imageVisibility === 'public') {
//       console.log("🔄 Images are public, returning original URLs");
//       return product.images || [];
//     }

//     console.log(`🔄 Refreshing signed URLs for ${product.imageKeys.length} private images...`);

//     const refreshedUrls = await Promise.all(
//       product.imageKeys.map(async (key, index) => {
//         try {
//           if (!key) {
//             console.warn(`⚠️ Empty key at index ${index}, using fallback`);
//             return product.images?.[index] || '';
//           }

//           const signedUrl = await generateSignedUrl(key);
//           console.log(`✅ Refreshed URL for image ${index + 1}`);
//           return signedUrl;
//         } catch (error) {
//           console.error(`❌ Failed to refresh URL for image ${index + 1}:`, error.message);
//           // Return original URL as fallback
//           return product.images?.[index] || '';
//         }
//       })
//     );

//     console.log(`✅ All ${refreshedUrls.length} signed URLs refreshed`);
//     return refreshedUrls;
//   } catch (error) {
//     console.error("❌ Error refreshing signed URLs:", error);
//     // Return original images as fallback
//     return product.images || [];
//   }
// };

// // Delete file from S3
// export const deleteFileFromS3 = async (fileUrl) => {
//   try {
//     let key;
//     if (fileUrl.includes("amazonaws.com/")) {
//       const urlParts = fileUrl.split(".amazonaws.com/");
//       key = urlParts[1];
//     } else {
//       key = fileUrl;
//     }

//     if (!key) {
//       console.error("❌ Invalid file URL or key");
//       return false;
//     }

//     const command = new DeleteObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     });

//     await s3Client.send(command);
//     console.log(`✅ File deleted from S3: ${key}`);
//     return true;
//   } catch (error) {
//     console.error("❌ Error deleting file from S3:", error);
//     return false;
//   }
// };

// // Delete multiple files from S3
// export const deleteMultipleFromS3 = async (fileUrls) => {
//   try {
//     if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
//       console.log("⚠️ No files to delete");
//       return true;
//     }

//     console.log(`🗑️ Deleting ${fileUrls.length} files from S3...`);

//     const deletePromises = fileUrls.map(async (fileUrl) => {
//       if (fileUrl) {
//         await deleteFileFromS3(fileUrl);
//       }
//     });

//     await Promise.all(deletePromises);
//     console.log(`✅ All ${fileUrls.length} files deleted from S3`);
//     return true;
//   } catch (error) {
//     console.error("❌ Error deleting multiple files from S3:", error);
//     return false;
//   }
// };

// // Check if file exists in S3
// export const checkFileExists = async (key) => {
//   try {
//     if (!key) {
//       console.log("⚠️ No key provided to check file existence");
//       return false;
//     }

//     const command = new HeadObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     });

//     await s3Client.send(command);
//     console.log(`✅ File exists in S3: ${key}`);
//     return true;
//   } catch (error) {
//     if (error.name === "NotFound") {
//       console.log(`❌ File not found in S3: ${key}`);
//       return false;
//     }
//     console.error("❌ Error checking file existence:", error);
//     throw error;
//   }
// };

// // Check if file is accessible via URL
// export const checkFileAccessible = async (url) => {
//   try {
//     if (!url) {
//       console.log("⚠️ No URL provided to check accessibility");
//       return false;
//     }

//     const response = await fetch(url, { method: "HEAD" });
//     const isAccessible = response.status === 200;

//     if (isAccessible) {
//       console.log(`✅ File is accessible: ${url}`);
//     } else {
//       console.log(`❌ File is not accessible (status: ${response.status}): ${url}`);
//     }

//     return isAccessible;
//   } catch (error) {
//     console.error(`❌ Error checking file accessibility for ${url}:`, error.message);
//     return false;
//   }
// };

// // Get file information
// export const getFileInfo = async (key) => {
//   try {
//     if (!key) {
//       throw new Error("No key provided");
//     }

//     const command = new HeadObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     });

//     const response = await s3Client.send(command);

//     const fileInfo = {
//       key,
//       size: response.ContentLength,
//       lastModified: response.LastModified,
//       contentType: response.ContentType,
//       etag: response.ETag,
//     };

//     console.log(`✅ Retrieved file info for: ${key}`);
//     return fileInfo;
//   } catch (error) {
//     console.error("❌ Error getting file info:", error);
//     throw error;
//   }
// };

// // Copy file within S3
// export const copyFileInS3 = async (sourceKey, destinationKey) => {
//   try {
//     if (!sourceKey || !destinationKey) {
//       throw new Error("Source and destination keys are required");
//     }

//     const copyCommand = new CopyObjectCommand({
//       Bucket: BUCKET_NAME,
//       CopySource: `${BUCKET_NAME}/${sourceKey}`,
//       Key: destinationKey,
//       // ACL removed - bucket doesn't allow ACLs
//     });

//     await s3Client.send(copyCommand);

//     const destinationUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationKey}`;

//     console.log(`✅ File copied from ${sourceKey} to ${destinationKey}`);
//     return { url: destinationUrl, key: destinationKey };
//   } catch (error) {
//     console.error("❌ Error copying file in S3:", error);
//     throw error;
//   }
// };

// // List files in a folder
// export const listFilesInFolder = async (folder = "products", maxKeys = 1000) => {
//   try {
//     const command = new ListObjectsV2Command({
//       Bucket: BUCKET_NAME,
//       Prefix: folder,
//       MaxKeys: maxKeys,
//     });

//     const response = await s3Client.send(command);

//     const files = response.Contents?.map(object => ({
//       key: object.Key,
//       size: object.Size,
//       lastModified: object.LastModified,
//       etag: object.ETag,
//     })) || [];

//     console.log(`✅ Found ${files.length} files in folder: ${folder}`);
//     return files;
//   } catch (error) {
//     console.error("❌ Error listing files in folder:", error);
//     throw error;
//   }
// };

// // Generate bulk signed URLs for multiple private files
// export const generateBulkSignedUrls = async (keys, expiresIn = 3600) => {
//   try {
//     if (!keys || !Array.isArray(keys) || keys.length === 0) {
//       console.log("⚠️ No keys provided for bulk signed URL generation");
//       return {};
//     }

//     console.log(`🔗 Generating bulk signed URLs for ${keys.length} files...`);

//     const signedUrlPromises = keys.map(async (key) => {
//       try {
//         if (!key) {
//           return { key, url: null, error: "Empty key" };
//         }

//         const signedUrl = await generateSignedUrl(key, expiresIn);
//         return { key, url: signedUrl, error: null };
//       } catch (error) {
//         console.error(`❌ Failed to generate signed URL for ${key}:`, error.message);
//         return { key, url: null, error: error.message };
//       }
//     });

//     const results = await Promise.all(signedUrlPromises);

//     // Convert to object for easy access
//     const signedUrls = {};
//     results.forEach(result => {
//       signedUrls[result.key] = result.url;
//     });

//     console.log(`✅ Generated ${Object.keys(signedUrls).length} signed URLs successfully`);
//     return signedUrls;
//   } catch (error) {
//     console.error("❌ Error generating bulk signed URLs:", error);
//     throw error;
//   }
// };

// // Upload with progress tracking (for large files)
// export const uploadWithProgress = async (
//   fileBuffer,
//   fileName,
//   mimetype,
//   folder = "products",
//   onProgress = null
// ) => {
//   try {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
//     const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

//     const command = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: fileBuffer,
//       ContentType: mimetype,
//       // ACL removed - bucket doesn't allow ACLs
//     });

//     // Simulate progress
//     if (onProgress) {
//       onProgress(50);
//     }

//     await s3Client.send(command);

//     if (onProgress) {
//       onProgress(100);
//     }

//     const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//     console.log(`✅ File uploaded to S3 with progress tracking: ${url}`);
//     return { url, key };
//   } catch (error) {
//     console.error("❌ Error uploading to S3 with progress:", error);
//     throw error;
//   }
// };

// // Validate S3 configuration
// export const validateS3Config = async () => {
//   try {
//     console.log("🔧 Validating S3 configuration...");

//     if (!BUCKET_NAME) {
//       throw new Error("BUCKET_NAME is not configured");
//     }

//     if (!s3Client) {
//       throw new Error("S3 client is not initialized");
//     }

//     // Try to list buckets to test connectivity
//     const command = new ListBucketsCommand({});
//     await s3Client.send(command);

//     console.log("✅ S3 configuration is valid");
//     return true;
//   } catch (error) {
//     console.error("❌ S3 configuration validation failed:", error);
//     throw error;
//   }
// };

// // Get public URL for a file
// export const getPublicUrl = (key) => {
//   return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
// };

// // Check if URL is from our S3 bucket
// export const isOurS3Url = (url) => {
//   return url && url.includes(`${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`);
// };

// // Extract key from S3 URL
// export const extractKeyFromUrl = (url) => {
//   if (!url || !isOurS3Url(url)) return null;

//   const urlParts = url.split(".amazonaws.com/");
//   return urlParts[1] || null;
// };

import { s3Client, BUCKET_NAME } from "../config/s3Config.js";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Upload single file to S3
export const uploadToS3 = async (
  fileBuffer,
  fileName,
  mimetype,
  folder = "products"
) => {
  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`✅ File uploaded to S3: ${url}`);
    return { url, key };
  } catch (error) {
    console.error("❌ Error uploading to S3:", error);
    throw error;
  }
};

export const uploadToS3banner = async (
  fileBuffer,
  fileName,
  mimetype,
  folder = "banners"
) => {
  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const key = `${folder}/${uniqueSuffix}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`✅ File uploaded to S3: ${url}`);
    return { url, key };
  } catch (error) {
    console.error("❌ Error uploading to S3:", error);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleToS3 = async (files, folder = "products") => {
  try {
    console.log(
      `📤 Starting multiple S3 upload for ${files.length} files to ${folder}...`
    );

    const uploadPromises = files.map(async (file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      console.log(`✅ File uploaded to S3: ${url}`);
      return { url, key };
    });

    const results = await Promise.all(uploadPromises);
    console.log(`✅ All ${files.length} files uploaded successfully`);

    return results;
  } catch (error) {
    console.error("❌ Multiple S3 Upload Error:", error);
    throw new Error(`Multiple S3 upload failed: ${error.message}`);
  }
};

// Specialized function for product images with organized folder structure (BACKWARD COMPATIBLE)
export const uploadProductImages = async (
  files,
  imageVisibility = "public"
) => {
  const folder =
    imageVisibility === "public" ? "products/public" : "products/private";

  console.log(
    `🖼️ Uploading ${files.length} product images to ${folder} (${imageVisibility})`
  );
  return await uploadMultipleToS3(files, folder);
};

// NEW: Specialized function for product files with organized folder structure
export const uploadProductFiles = async (
  files,
  imageVisibility = "public",
  uploadType = "images"
) => {
  let folder;

  if (uploadType === "files") {
    // For files, use files/public or files/private
    folder = imageVisibility === "public" ? "files/public" : "files/private";
    console.log(
      `📁 Uploading ${files.length} product files to ${folder} (${imageVisibility})`
    );
  } else {
    // For images (default), use products/public or products/private
    folder =
      imageVisibility === "public" ? "products/public" : "products/private";
    console.log(
      `🖼️ Uploading ${files.length} product images to ${folder} (${imageVisibility})`
    );
  }

  return await uploadMultipleToS3(files, folder);
};

// Generate signed URL for private files
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(
      `✅ Generated signed URL for: ${key} (expires in ${expiresIn}s)`
    );
    return signedUrl;
  } catch (error) {
    console.error("❌ Error generating signed URL:", error);
    throw error;
  }
};

// Get accessible URL based on visibility
export const getAccessibleUrl = async (key, imageVisibility = "public") => {
  try {
    if (imageVisibility === "public") {
      const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log(`🔗 Using public URL: ${publicUrl}`);
      return publicUrl;
    } else {
      console.log(`🔒 Generating signed URL for private file: ${key}`);
      const signedUrl = await generateSignedUrl(key);
      return signedUrl;
    }
  } catch (error) {
    console.error("❌ Error getting accessible URL:", error);
    throw error;
  }
};

// Refresh signed URLs for a product
export const refreshSignedUrls = async (product) => {
  try {
    if (!product || !product.imageKeys || !Array.isArray(product.imageKeys)) {
      console.log("⚠️ No file keys found for product");
      return product.images || [];
    }

    if (product.imageVisibility === "public") {
      console.log("🔄 Files are public, returning original URLs");
      return product.images || [];
    }

    console.log(
      `🔄 Refreshing signed URLs for ${product.imageKeys.length} private files...`
    );

    const refreshedUrls = await Promise.all(
      product.imageKeys.map(async (key, index) => {
        try {
          if (!key) {
            console.warn(`⚠️ Empty key at index ${index}, using fallback`);
            return product.images?.[index] || "";
          }

          const signedUrl = await generateSignedUrl(key);
          console.log(`✅ Refreshed URL for file ${index + 1}`);
          return signedUrl;
        } catch (error) {
          console.error(
            `❌ Failed to refresh URL for file ${index + 1}:`,
            error.message
          );
          // Return original URL as fallback
          return product.images?.[index] || "";
        }
      })
    );

    console.log(`✅ All ${refreshedUrls.length} signed URLs refreshed`);
    return refreshedUrls;
  } catch (error) {
    console.error("❌ Error refreshing signed URLs:", error);
    // Return original files as fallback
    return product.images || [];
  }
};

// Delete file from S3
export const deleteFileFromS3 = async (fileUrl) => {
  try {
    let key;
    if (fileUrl.includes("amazonaws.com/")) {
      const urlParts = fileUrl.split(".amazonaws.com/");
      key = urlParts[1];
    } else {
      key = fileUrl;
    }

    if (!key) {
      console.error("❌ Invalid file URL or key");
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✅ File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting file from S3:", error);
    return false;
  }
};

// Delete multiple files from S3
export const deleteMultipleFromS3 = async (fileUrls) => {
  try {
    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      console.log("⚠️ No files to delete");
      return true;
    }

    console.log(`🗑️ Deleting ${fileUrls.length} files from S3...`);

    const deletePromises = fileUrls.map(async (fileUrl) => {
      if (fileUrl) {
        await deleteFileFromS3(fileUrl);
      }
    });

    await Promise.all(deletePromises);
    console.log(`✅ All ${fileUrls.length} files deleted from S3`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting multiple files from S3:", error);
    return false;
  }
};

// Check if file exists in S3
export const checkFileExists = async (key) => {
  try {
    if (!key) {
      console.log("⚠️ No key provided to check file existence");
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✅ File exists in S3: ${key}`);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      console.log(`❌ File not found in S3: ${key}`);
      return false;
    }
    console.error("❌ Error checking file existence:", error);
    throw error;
  }
};

// Check if file is accessible via URL
export const checkFileAccessible = async (url) => {
  try {
    if (!url) {
      console.log("⚠️ No URL provided to check accessibility");
      return false;
    }

    const response = await fetch(url, { method: "HEAD" });
    const isAccessible = response.status === 200;

    if (isAccessible) {
      console.log(`✅ File is accessible: ${url}`);
    } else {
      console.log(
        `❌ File is not accessible (status: ${response.status}): ${url}`
      );
    }

    return isAccessible;
  } catch (error) {
    console.error(
      `❌ Error checking file accessibility for ${url}:`,
      error.message
    );
    return false;
  }
};

// Get file information
export const getFileInfo = async (key) => {
  try {
    if (!key) {
      throw new Error("No key provided");
    }

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    const fileInfo = {
      key,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
      etag: response.ETag,
    };

    console.log(`✅ Retrieved file info for: ${key}`);
    return fileInfo;
  } catch (error) {
    console.error("❌ Error getting file info:", error);
    throw error;
  }
};

// Copy file within S3
export const copyFileInS3 = async (sourceKey, destinationKey) => {
  try {
    if (!sourceKey || !destinationKey) {
      throw new Error("Source and destination keys are required");
    }

    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(copyCommand);

    const destinationUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationKey}`;

    console.log(`✅ File copied from ${sourceKey} to ${destinationKey}`);
    return { url: destinationUrl, key: destinationKey };
  } catch (error) {
    console.error("❌ Error copying file in S3:", error);
    throw error;
  }
};

// List files in a folder
export const listFilesInFolder = async (
  folder = "products",
  maxKeys = 1000
) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folder,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);

    const files =
      response.Contents?.map((object) => ({
        key: object.Key,
        size: object.Size,
        lastModified: object.LastModified,
        etag: object.ETag,
      })) || [];

    console.log(`✅ Found ${files.length} files in folder: ${folder}`);
    return files;
  } catch (error) {
    console.error("❌ Error listing files in folder:", error);
    throw error;
  }
};

// Generate bulk signed URLs for multiple private files
export const generateBulkSignedUrls = async (keys, expiresIn = 3600) => {
  try {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      console.log("⚠️ No keys provided for bulk signed URL generation");
      return {};
    }

    console.log(`🔗 Generating bulk signed URLs for ${keys.length} files...`);

    const signedUrlPromises = keys.map(async (key) => {
      try {
        if (!key) {
          return { key, url: null, error: "Empty key" };
        }

        const signedUrl = await generateSignedUrl(key, expiresIn);
        return { key, url: signedUrl, error: null };
      } catch (error) {
        console.error(
          `❌ Failed to generate signed URL for ${key}:`,
          error.message
        );
        return { key, url: null, error: error.message };
      }
    });

    const results = await Promise.all(signedUrlPromises);

    // Convert to object for easy access
    const signedUrls = {};
    results.forEach((result) => {
      signedUrls[result.key] = result.url;
    });

    console.log(
      `✅ Generated ${Object.keys(signedUrls).length} signed URLs successfully`
    );
    return signedUrls;
  } catch (error) {
    console.error("❌ Error generating bulk signed URLs:", error);
    throw error;
  }
};

// Upload with progress tracking (for large files)
export const uploadWithProgress = async (
  fileBuffer,
  fileName,
  mimetype,
  folder = "products",
  onProgress = null
) => {
  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${folder}/${uniqueSuffix}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    // Simulate progress
    if (onProgress) {
      onProgress(50);
    }

    await s3Client.send(command);

    if (onProgress) {
      onProgress(100);
    }

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`✅ File uploaded to S3 with progress tracking: ${url}`);
    return { url, key };
  } catch (error) {
    console.error("❌ Error uploading to S3 with progress:", error);
    throw error;
  }
};

// Validate S3 configuration
export const validateS3Config = async () => {
  try {
    console.log("🔧 Validating S3 configuration...");

    if (!BUCKET_NAME) {
      throw new Error("BUCKET_NAME is not configured");
    }

    if (!s3Client) {
      throw new Error("S3 client is not initialized");
    }

    // Try to list buckets to test connectivity
    const command = new ListBucketsCommand({});
    await s3Client.send(command);

    console.log("✅ S3 configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ S3 configuration validation failed:", error);
    throw error;
  }
};

// Get public URL for a file
export const getPublicUrl = (key) => {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

// Check if URL is from our S3 bucket
export const isOurS3Url = (url) => {
  return (
    url &&
    url.includes(`${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`)
  );
};

// Extract key from S3 URL
export const extractKeyFromUrl = (url) => {
  if (!url || !isOurS3Url(url)) return null;

  const urlParts = url.split(".amazonaws.com/");
  return urlParts[1] || null;
};
