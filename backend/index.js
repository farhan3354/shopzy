import express from "express";
import dovenv from "dotenv";
import ConnectDB from "./config/db.js";
import AuthRoute from "./routes/authRoutes.js";
import cors from "cors";
import categoryRoute from "./routes/categoryRoute.js";
import subcategoryRoute from "./routes/subcategoryRoute.js";
import productRoute from "./routes/productRoute.js";
import attributeRoutes from "./routes/attributesRoute.js";
import wishList from "./routes/wishlist.js";
import cart from "./routes/cartRoutes.js";
import order from "./routes/order.js";
import couponRoutes from "./routes/couponRoutes.js";
import ContactRoute from "./routes/contactRoute.js";
import faqRoutes from "./routes/faqRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import footerRoutes from "./routes/footerRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import uploadText from "./routes/uploadRoutes.js";
import servicecontactRoutes from "./routes/servicescontactRoutes.js";
dovenv.config();

const app = express();

// ✅ FIXED: Webhook middleware must come BEFORE express.json()
const rawBodyMiddleware = (req, res, next) => {
  if (req.path === "/api/webhook") {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
};

// ✅ Apply rawBodyMiddleware FIRST for webhooks
app.use(rawBodyMiddleware);

// ✅ Then apply other middleware
app.use(cors());
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       const allowed = [
//         "https://jobzy-seven.vercel.app",
//         "http://localhost:5173",
//       ];
//       if (!origin || allowed.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     optionsSuccessStatus: 200,
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
app.use("/api", AuthRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/subcategories", subcategoryRoute);
app.use("/api/products", productRoute);
app.use("/api/attributes", attributeRoutes);
app.use("/api/wishlist/", wishList);
app.use("/api/", cart);
app.use("/api/faqs", faqRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api", order);
app.use("/api/coupons/", couponRoutes);
app.use("/api", ContactRoute);
app.use("/api/footer/", footerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/pages/dynamic", pageRoutes);
app.use("/api/upload", uploadText);
app.use("/api/contact", servicecontactRoutes);

app.get("/", (req, res) => {
  res.send("E-Commerce API is running...");
});

ConnectDB();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server started at port", PORT);
});

// import express from "express";
// import dovenv from "dotenv";
// import ConnectDB from "./config/db.js";
// import AuthRoute from "./routes/authRoutes.js";
// import cors from "cors";
// import categoryRoute from "./routes/categoryRoute.js";
// import subcategoryRoute from "./routes/subcategoryRoute.js";
// import productRoute from "./routes/productRoute.js";
// import attributeRoutes from "./routes/attributesRoute.js";
// import wishList from "./routes/wishlist.js";
// import cart from "./routes/cartRoutes.js";
// import order from "./routes/order.js";
// import couponRoutes from "./routes/couponRoutes.js";
// import ContactRoute from "./routes/contactRoute.js";
// import faqRoutes from "./routes/faqRoutes.js";
// import bannerRoutes from "./routes/bannerRoutes.js";
// import footerRoutes from "./routes/footerRoutes.js";

// dovenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // middleware/rawBody.js
//  const rawBodyMiddleware = (req, res, next) => {
//   if (req.path === '/api/webhook') {
//     let data = '';
//     req.setEncoding('utf8');
//     req.on('data', (chunk) => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       req.rawBody = data;
//       next();
//     });
//   } else {
//     next();
//   }
// };
// app.use(rawBodyMiddleware);

// app.use("/api", AuthRoute);
// app.use("/api/categories", categoryRoute);
// app.use("/api/subcategories", subcategoryRoute);
// app.use("/api/products", productRoute);
// app.use("/api/attributes", attributeRoutes);
// app.use("/api/wishlist/", wishList);
// app.use("/api/", cart);
// app.use("/api/faqs", faqRoutes);
// app.use("/api/banners", bannerRoutes);
// app.use("/api", order);
// app.use("/api", couponRoutes);
// app.use("/api", ContactRoute);
// app.use("/api", footerRoutes);

// app.get("/", (req, res) => {
//   res.send("E-Commerce API is running...");
// });

// ConnectDB();
// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => {
//   console.log("Server started at port", PORT);
// });
