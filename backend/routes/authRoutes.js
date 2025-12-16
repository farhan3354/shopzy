import express from "express";
import {
  addUserAddress,
  changeCustomerStatus,
  getcustomer,
  getUserAddresses,
  loginUser,
  registerForm,
  resendVerification,
  setDefaultAddress,
  verifyAccount,
} from "../controllers/authController.js";
import { adminMiddleware, protect } from "../middlewares/authMidddleware.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello from the server");
});

router.post("/authregister", registerForm);

router.post("/login", loginUser);

router.get("/verify-account/:token", verifyAccount);
router.post("/resend-verification", resendVerification);

router.get("/verify", protect, (req, res) => {
  res.json({
    message: "Token valid",
    user: { id: req.user.id, role: req.user.role },
  });
});

router.get("/customer", protect, adminMiddleware, getcustomer);

router.get("/user/addresses", protect, getUserAddresses);
router.post("/user/addresses/add", protect, addUserAddress);
router.put("/user/addresses/default", protect, setDefaultAddress);


router.put(
  "/customer/changestatus/:id",
  protect,
  adminMiddleware,
  changeCustomerStatus
);

export default router;
