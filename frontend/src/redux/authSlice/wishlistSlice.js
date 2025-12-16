import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from './../../../utils/api';

export const fetchWishlistCount = createAsyncThunk(
  "wishlist/fetchCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return 0;
      }

      const response = await api.get("/wishlist");
      return response.data.wishlist?.length || 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

// Async thunk to update wishlist count after add/remove
export const updateWishlistCount = createAsyncThunk(
  "wishlist/updateCount",
  async (action, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return 0;
      }

      const response = await api.get("/wishlist");
      return response.data.wishlist?.length || 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update wishlist"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setWishlistCount: (state, action) => {
      state.count = action.payload;
    },
    incrementWishlistCount: (state) => {
      state.count += 1;
    },
    decrementWishlistCount: (state) => {
      state.count = Math.max(0, state.count - 1);
    },
    clearWishlistCount: (state) => {
      state.count = 0;
      state.error = null;
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist count
      .addCase(fetchWishlistCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload;
      })
      .addCase(fetchWishlistCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.count = 0;
      })
      // Update wishlist count
      .addCase(updateWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      });
  },
});

export const {
  setWishlistCount,
  incrementWishlistCount,
  decrementWishlistCount,
  clearWishlistCount,
  clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
