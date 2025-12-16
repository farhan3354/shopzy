export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  verify: "/auth/verify",
};

export const ATTRIBUTE_ROUTES = {
  all: "/attributes",
  single: (id) => `/attributes/${id}`,
  create: "/attributes",
  update: (id) => `/attributes/${id}`,
  delete: (id) => `/attributes/${id}`,
};

export const SUBCATEGORY_ROUTES = {
  all: "/subcategories",
  single: (id) => `/subcategories/${id}`,
  create: "/subcategories",
  update: (id) => `/subcategories/${id}`,
  delete: (id) => `/subcategories/${id}`,
  byCategory: (categoryId) => `/subcategories?category=${categoryId}`,
};

export const PRODUCT_ROUTES = {
  all: "/products",
  single: (id) => `/products/${id}`,
  create: "/products",
  update: (id) => `/products/${id}`,
  delete: (id) => `/products/${id}`,
  changeStatus: (id) => `/products/changestatus/${id}`,
  byCategory: (categoryId) => `/products/category/${categoryId}`,
};

export const COUPON_ROUTES = {
  cashbacks: "/coupons/cashbacks",
  referrals: "/coupons/admin",
  approveCashback: (id) => `/coupons/cashbacks/${id}/approve`,
  creditCashback: (id) => `/coupons/cashbacks/${id}/credit`,
  rejectCashback: (id) => `/coupons/cashbacks/${id}/reject`,
  approveReferral: (referralId, orderIndex) =>
    `/coupons/${referralId}/orders/${orderIndex}/approve`,
  creditReferral: (referralId, orderIndex) =>
    `/coupons/${referralId}/orders/${orderIndex}/credit`,
  rejectReferral: (referralId, orderIndex) =>
    `/coupons/${referralId}/orders/${orderIndex}/reject`,
  all: "/coupons/all",
  single: (id) => `/coupons/${id}`,
  create: "/coupons/create",
  update: (id) => `/coupons/update/${id}`,
  delete: (id) => `/coupons/delete/${id}`,
};

export const USER_ROUTES = {
  customers: "/customer",
  changeStatus: (id) => `/customer/changestatus/${id}`,
  vendors: "/vendors",
  allUsers: "/users",
};

export const CATEGORY_ROUTES = {
  all: "/categories",
  single: (id) => `/categories/${id}`,
  create: "/categories",
  update: (id) => `/categories/${id}`,
};

export const ORDER_ROUTES = {
  all: "/getall-orders",
  single: (id) => `/orders/${id}`,
  create: "/orders",
  update: (id) => `/updatestatus/${id}/status`,
  delete: (id) => `/delete-oder/${id}`,
  userOrders: "/user-orders",
};

export const CONTACT_ROUTES = {
  all: "/admin/contact-messages",
  delete: (id) => `/admin/contact-messages/${id}`,
};

export const FAQ_ROUTES = {
  all: "/faqs",
  single: (id) => `/faqs/${id}`,
  create: "/faqs",
  update: (id) => `/faqs/${id}`,
  delete: (id) => `/faqs/${id}`,
};

export const BANNER_ROUTES = {
  all: "/banners",
  single: (id) => `/banners/${id}`,
  create: "/banners/add",
  update: (id) => `/banners/${id}`,
  delete: (id) => `/banners/${id}`,
};

export const FOOTER_ROUTES = {
  get: "/footer/get",
  create: "/footer/post",
  update: "/footer/update",
  delete: "/footer/delete",
};
