import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/config/axios";

// Async thunk for fetching live matches grouped by league
export const fetchLiveMatches = createAsyncThunk(
  "liveMatches/fetchLiveMatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/fixtures/live");
      // Expecting response.data to be an array of { league, matches }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch live matches"
      );
    }
  }
);

// Async thunk for silently updating live matches (no loading state)
export const silentUpdateLiveMatches = createAsyncThunk(
  "liveMatches/silentUpdateLiveMatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/fixtures/live");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch live matches"
      );
    }
  }
);

const liveMatchesSlice = createSlice({
  name: "liveMatches",
  initialState: {
    data: [], // Array of { league, matches }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveMatches.pending, (state) => {
        // Only show loading if we don't have existing data (initial load)
        if (state.data.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLiveMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLiveMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Silent live matches update (no loading state changes)
      .addCase(silentUpdateLiveMatches.fulfilled, (state, action) => {
        state.data = action.payload;
        // Clear any existing errors since update was successful
        state.error = null;
      })
      .addCase(silentUpdateLiveMatches.rejected, (state, action) => {
        // Don't update loading state, just log the error silently
        console.warn('Silent live matches update failed:', action.payload);
      });
  },
});

export default liveMatchesSlice.reducer;

// Selectors
export const selectLiveMatches = (state) => state.liveMatches.data;
export const selectLiveMatchesLoading = (state) => state.liveMatches.loading;
export const selectLiveMatchesError = (state) => state.liveMatches.error; 