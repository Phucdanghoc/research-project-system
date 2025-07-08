import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

// Axios instance with dynamic token (to handle token updates)
const getApiInstance = () => axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

interface AccountState {
  users: User[];
  profile: User | null; // Added to store profile data
  loading: boolean;
  error: string | null;
}

interface PasswordChangePayload {
  oldPassword: string;
  newPassword: string; // Renamed currentPassword to newPassword for clarity
}

const initialState: AccountState = {
  users: [],
  profile: null,
  loading: false,
  error: null,
};

// Update user async thunk
export const updateUserAsync = createAsyncThunk<User, User & { password?: string }, { rejectValue: string }>(
  'accounts/updateUser',
  async (user, { rejectWithValue }) => {
    try {
      const response = await getApiInstance().put<User>(`/users/${user.id}`, user);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

// Get profile async thunk
export const getProfileAsync = createAsyncThunk<User, void, { rejectValue: string }>(
  'accounts/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getApiInstance().get<User>('/users/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Change password async thunk
export const changePasswordAsync = createAsyncThunk<void, PasswordChangePayload, { rejectValue: string }>(
  'accounts/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      await getApiInstance().post('/users/change-password', { current_password : oldPassword, new_password : newPassword });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

// Reset password async thunk
export const resetPasswordAsync = createAsyncThunk<void, string, { rejectValue: string }>(
  'accounts/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      await getApiInstance().post('/users/reset-password', { email });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generic handler for async thunks
    const handleAsync = <T>(
      action: any,
      onFulfilled: (state: AccountState, action: { payload: T }) => void
    ) => {
      builder
        .addCase(action.pending, (state: AccountState) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(action.fulfilled, (state: AccountState, action: { payload: T }) => {
          state.loading = false;
          onFulfilled(state, action);
          state.error = null;
        })
        .addCase(action.rejected, (state: AccountState, action: { payload?: string }) => {
          state.loading = false;
          state.error = action.payload || 'An error occurred';
        });
    };

    // Handle updateUserAsync
    handleAsync<User>(updateUserAsync, (state, action) => {
      const index = state.users.findIndex((user) => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      } else {
        state.users.push(action.payload);
      }
    });
    handleAsync<User>(getProfileAsync, (state, action) => {
      state.profile = action.payload;
    });

    handleAsync<void>(changePasswordAsync, () => {});
    handleAsync<void>(resetPasswordAsync, () => {});
  },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;