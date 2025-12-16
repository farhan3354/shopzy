import { configureStore } from "@reduxjs/toolkit";
import authslice from "./authSlice/authSlice.js";
import wishlistReducer from "./authSlice/wishlistSlice.js";
import cartReducer from "./authSlice/cartSlice.js";

const store = configureStore({
  reducer: {
    auth: authslice,
    wishlist: wishlistReducer,
    cart: cartReducer,
  },
});

export default store;
