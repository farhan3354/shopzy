// import { S3Client } from "@aws-sdk/client-s3";
// import multer from "multer";
// import dotenv from "dotenv";

// dotenv.config();

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || "us-east-1",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// const memoryStorage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedMimes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     "image/avif",
//     "image/gif",
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         `File type ${file.mimetype} not allowed. Only images are allowed!`
//       ),
//       false
//     );
//   }
// };

// export const uploadbanner = multer({
//   storage: memoryStorage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// export const upload = multer({
//   storage: memoryStorage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//     files: 5,
//   },
// });

// export { s3Client, BUCKET_NAME };

import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    "application/zip",
    "application/x-zip-compressed",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} not allowed. Only images and documents are allowed!`
      ),
      false
    );
  }
};

export const uploadbanner = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for files
    files: 5,
  },
});

export { s3Client, BUCKET_NAME };

// import { S3Client } from "@aws-sdk/client-s3";
// import multer from "multer";
// import dotenv from "dotenv";

// dotenv.config();

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || "us-east-1",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// const memoryStorage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedMimes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     "image/avif",
//     "image/gif",
//     "application/zip",
//     "application/x-zip-compressed",
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "text/plain",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         `File type ${file.mimetype} not allowed. Only images and documents are allowed!`
//       ),
//       false
//     );
//   }
// };

// export const uploadbanner = multer({
//   storage: memoryStorage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// export const upload = multer({
//   storage: memoryStorage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024,
//     files: 5,
//   },
// });

// export { s3Client, BUCKET_NAME };
