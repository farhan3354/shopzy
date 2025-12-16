export const navItems = [
  { name: "Home", to: "/" },
  { name: "Shop", to: "/shop" },
  { name: "Categories", to: "#" },
  { name: "Contact", to: "/contact-us" },
];

export const stats = [
  { label: "  Jobs posted monthly", value: " 25,000+" },
  { label: " Successful hires", value: "50,000+" },
  { label: "Companies registered", value: "8,000+" },
  { label: "Average time to hire", value: "14 days" },
];

export const menuItems = [
  {
    title: "Home",
    icon: "IoHome",
    to: "/user-dashboard",
  },
  {
    title: "Applied jobs",
    icon: "MdSend",
    to: "/user-dashboard/applied",
  },

  {
    title: "All Jobs",
    icon: "MdOutlineWorkOutline",
    to: "/user-dashboard/jobs",
  },
  {
    title: "See Interview",
    to: "/user-dashboard/interview",
    icon: "MdWork",
  },
  {
    title: "Profile",
    icon: "IoIosContact",
    to: "/user-dashboard/profile",
  },
];

export const venorsidebarmenu = [
  {
    title: "Dashboard",
    icon: "MdDashboard",
    to: "/vendor",
  },

  {
    title: "Add Product",
    icon: "MdAddBox",
    to: "/vendor/add-product",
  },
  {
    title: "See Product",
    icon: "MdAddBox",
    to: "/vendor/products",
  },
  {
    title: "Attributes",
    icon: "MdInventory",
    to: "/vendor/attributes",
  },

  {
    title: "Subcategory",
    icon: "MdInventory",
    to: "/vendor/subcategories",
  },
  {
    title: "Order",
    icon: "MdListAlt",
    to: "/vendor/orders",
  },
  // {
  //   title: "Coupans",
  //   icon: "MdListAlt",
  //   to: "/vendor/coupons",
  // },
];

export const adminsidebarmenu = [
  {
    title: "Dashboard",
    icon: "MdDashboard",
    to: "/admin-dashboard",
  },
  {
    title: "Users",
    icon: "FaUserFriends",
    to: "/admin-dashboard/manage-users",
  },
  {
    title: "Vendor",
    icon: "FaStore",
    to: "/admin-dashboard/manage-vendor",
  },
  {
    title: "Add Product",
    icon: "MdAddBox",
    to: "/admin-dashboard/add-product",
  },
  {
    title: "See Product",
    icon: "MdAddBox",
    to: "/admin-dashboard/products",
  },
  {
    title: "Attributes",
    icon: "MdInventory",
    to: "/admin-dashboard/attributes",
  },
  {
    title: "Category",
    icon: "MdInventory",
    to: "/admin-dashboard/categories",
  },

  {
    title: "Subcategory",
    icon: "MdInventory",
    to: "/admin-dashboard/subcategories",
  },
  {
    title: "Order",
    icon: "MdListAlt",
    to: "/admin-dashboard/orders",
  },
  {
    title: "Coupans",
    icon: "MdListAlt",
    to: "/admin-dashboard/coupons",
  },
  {
    title: "Banner",
    icon: "MdListAlt",
    to: "/admin-dashboard/add-banners",
  },
   {
    title: "FAQ",
    icon: "MdListAlt",
    to: "/admin-dashboard/faq",
  },{
    title: "Message",
    icon: "MdListAlt",
    to: "/admin-dashboard/messages",
  },
  {
    title: "Payments",
    icon: "MdListAlt",
    to: "/admin-dashboard/payment",
  } ,{
    title: "Cashbask",
    icon: "MdListAlt",
    to: "/admin-dashboard/cashbacks",
  } ,{
    title: "Footer",
    icon: "MdInventory",
    to: "/admin-dashboard/footer",
  },

];

export const statsofhome = [
  { value: "50,000+", label: "Jobs Available" },
  { value: "8,000+", label: "Companies Hiring" },
  { value: "1M+", label: "Candidates Hired" },
  { value: "95%", label: "Satisfaction Rate" },
];

export const faqs = [
  {
    question: "How can I track my order?",
    answer:
      'You can track your order using the tracking number sent to your email. Visit the "Order Tracking" page for real-time updates.',
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for unused items in original packaging. Some items may have specific return conditions.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.",
  },
  {
    question: "How can I change my delivery address?",
    answer:
      "You can change your delivery address within 1 hour of placing the order. Contact our support team for assistance.",
  },
];
