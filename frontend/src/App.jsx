import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollTop from "./pages/ScrollTop";
import Profile from "./pages/vendorDashboard/Profile";
import Orders from "./pages/vendorDashboard/Order";
import UserLayout from "./components/common/vendorLayout/VendorLayout";
import Dashboard from "./pages/vendorDashboard/Dashboard";
import Products from "./pages/vendorDashboard/Products";
import Reports from "./pages/vendorDashboard/Report";
import CustomerProfile from "./pages/customerDashboard/CustomerProfile";
import CustomerDashboard from "./pages/customerDashboard/CustomerDashboard";
import CustomerOrders from "./pages/customerDashboard/CustomerOrders";
import CustomerLayout from "./components/common/customerLayout/CustomerLayout";
import CustomerSupport from "./pages/customerDashboard/CustomerSupport";
import EcommerceHomepage from "./pages/Home";
import Layout from "./components/common/Layout";
import WishList from "./pages/WishList";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import ProtectRoute from "./protected/ProtectedRoutes";
import ProductForm from "./components/admindashboard/ProductForm";
import AdminLayout from "./components/common/admin/AdminLayout";
import AdminDashboard from "./pages/adminDashboard/Dashboard";
import AllUser from "./pages/adminDashboard/AllUser";
import AllVendor from "./pages/adminDashboard/AllVendor";
import OrderSuccess from "./pages/OrderSuccess";
import Checkout from "./pages/Checkoutpage";
import Order from "./pages/vendorDashboard/Order";
import AllOders from "./pages/adminDashboard/AllOders";
import OrderPending from "./components/admindashboard/OrderPending";
import UserOrders from "./pages/UserPending";
import Coupons from "./pages/adminDashboard/Coupons";
import FeatureProduct from "./components/homePage/FeatureProduct";
import ContactUS from "./pages/ContactUS";
import ContactMessage from "./pages/adminDashboard/ContactMesages";
import AdminEditProduct from "./pages/adminDashboard/AdminEditProduct";
import AdminAddProduct from "./pages/adminDashboard/AdminAddProduct";
import AddAttributes from "./pages/adminDashboard/AddAttributes";
import AllProduct from "./pages/adminDashboard/AllProduct";
import Details from "./pages/Details";
import AddCategory from "./pages/adminDashboard/AddCategory";
import AddSubcategory from "./pages/adminDashboard/AddSubcategory";
import AdminFaqPage from "./components/admindashboard/AdminFaqPage";
import AdminBanner from "./components/admindashboard/AdminBanner";
import CategoryProducts from "./components/CategoryProducts";
import FooterManagement from "./components/admindashboard/FooterManagement";
import SearchPage from "./components/common/SearchPage";
import SubcategoryProducts from "./components/SubCategoryProduct";
import ResendVerification from "./components/Login/ResendVerification";
import VerifyAccount from "./components/Login/VerifyAccount";
import AdminPayment from "./components/admindashboard/AdminPayment";
import CashbackManagement from "./components/admindashboard/CashbackManagement";
import EmailAnnouncement from "./components/admindashboard/EmailAnnouncement";
import PageList from "./components/PageList";
import PageForm from "./components/PageForm";
import DynamicPage from "./components/DynamicPage";
import About from "./pages/About";

function App() {
  return (
    <>
      <Router>
        <ScrollTop />

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<EcommerceHomepage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="wishlist" element={<WishList />} />
            <Route path="cart" element={<Cart />} />
            <Route path="shop" element={<Shop />} />
            <Route path="about" element={<About />} />
            <Route path="order-pending/:id" element={<OrderPending />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="/verify-account/:token" element={<VerifyAccount />} />
            <Route
              path="/resend-verification"
              element={<ResendVerification />}
            />
            <Route path="product/:id" element={<Details />} />
            <Route path="/category/:id" element={<CategoryProducts />} />
            <Route
              path="/category/:categoryId/subcategory/:subcategoryId"
              element={<SubcategoryProducts />}
            />
            <Route path="product" element={<FeatureProduct />} />
            <Route path="contact-us" element={<ContactUS />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          </Route>
          <Route element={<ProtectRoute allowedRoles={["user", "customer"]} />}>
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="support" element={<CustomerSupport />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>
          </Route>
          <Route element={<ProtectRoute allowedRoles={["vendor"]} />}>
            <Route path="/vendor" element={<UserLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reports" element={<Reports />} />
              <Route path="attributes" element={<AddAttributes />} />
              <Route path="profile" element={<Profile />} />
              <Route path="subcategories" element={<AddSubcategory />} />
              <Route path="add-product" element={<ProductForm />} />
            </Route>
          </Route>

          <Route element={<ProtectRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="manage-users" element={<AllUser />} />
              <Route path="manage-vendor" element={<AllVendor />} />
              <Route path="categories" element={<AddCategory />} />
              <Route path="subcategories" element={<AddSubcategory />} />
              <Route path="attributes" element={<AddAttributes />} />
              <Route path="products" element={<AllProduct />} />
              <Route path="payment" element={<AdminPayment />} />
              <Route path="add-product" element={<AdminAddProduct />} />
              <Route path="edit-product/:id" element={<AdminEditProduct />} />
              <Route path="orders" element={<AllOders />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="messages" element={<ContactMessage />} />
              <Route path="faq" element={<AdminFaqPage />} />
              <Route path="add-banners" element={<AdminBanner />} />
              <Route path="footer" element={<FooterManagement />} />
              <Route path="cashbacks" element={<CashbackManagement />} />
              <Route path="email" element={<EmailAnnouncement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
