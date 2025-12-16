// import express from "express";
// import {
//   createBanner,
//   getBanners,
//   deleteBanner,
// } from "../controllers/bannerController.js";
// import { uploadbanner } from "../middlewares/multermiddleware.js";

// const router = express.Router();

// router.post("/add", uploadbanner.single("image"), createBanner);
// router.get("/", getBanners);
// router.delete("/:id", deleteBanner);

// export default router;

import express from "express";
import {
  createBanner,
  getBanners,
  deleteBanner,
  updateBanner,
  getBannerById,
  toggleBannerStatus,
} from "../controllers/bannerController.js";
import { uploadbanner } from "../config/s3Config.js";

const router = express.Router();

router.get("/", getBanners);
router.get("/:id", getBannerById);

router.post("/add", uploadbanner.single("image"), createBanner);
router.put("/update/:id", uploadbanner.single("image"), updateBanner);
router.delete("/:id", deleteBanner);
router.patch(
  "/toggle-status/:id",

  toggleBannerStatus
);

export default router;
