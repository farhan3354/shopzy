import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

// Async thunk to fetch cart count
export const fetchCartCount = createAsyncThunk(
  "cart/fetchCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return 0;
      }

      const response = await api.get("/cartproduct");
      const cartItems = response.data.cart?.items || [];

      // Calculate total quantity of all items in cart
      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return totalCount;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// Async thunk to update cart count after add/remove/update
export const updateCartCount = createAsyncThunk(
  "cart/updateCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return 0;
      }

      const response = await api.get("/cartproduct");
      const cartItems = response.data.cart?.items || [];

      // Calculate total quantity of all items in cart
      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return totalCount;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCartCount: (state, action) => {
      state.count = action.payload;
    },
    incrementCartCount: (state, action) => {
      state.count += action.payload || 1;
    },
    decrementCartCount: (state, action) => {
      state.count = Math.max(0, state.count - (action.payload || 1));
    },
    clearCartCount: (state) => {
      state.count = 0;
      state.error = null;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart count
      .addCase(fetchCartCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload;
      })
      .addCase(fetchCartCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.count = 0;
      })
      // Update cart count
      .addCase(updateCartCount.fulfilled, (state, action) => {
        state.count = action.payload;
      });
  },
});

export const {
  setCartCount,
  incrementCartCount,
  decrementCartCount,
  clearCartCount,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
