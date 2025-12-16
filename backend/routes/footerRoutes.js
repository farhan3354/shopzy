import express from "express";
import {
  getFooter,
  updateFooter,
  getFooterHistory,
} from "../controllers/footerController.js";
import { protect, adminMiddleware } from "../middlewares/authMidddleware.js";

const router = express.Router();

// Public route
router.get("/get", getFooter);

// Admin routes
router.post("/post", protect, adminMiddleware, updateFooter);
router.get("/history", protect, adminMiddleware, getFooterHistory);

export default router;

// import express from "express";
// import {
//   getFooter,
//   addFooter,
//   updateFooter,
//   updateAbout,
//   updateContact,
//   addContactDetail,
//   updateContactDetail,
//   deleteContactDetail,
// } from "../controllers/footerController.js";

// const router = express.Router();

// router.get("/footer", getFooter);
// router.post("/footer", addFooter);
// router.put("/footer", updateFooter);

// router.patch("/footer/about", updateAbout);
// router.patch("/footer/contact", updateContact);

// router.post("/footer/contact/details", addContactDetail);
// router.put("/footer/contact/details/:detailId", updateContactDetail);
// router.delete("/footer/contact/details/:detailId", deleteContactDetail);

// export default router;
