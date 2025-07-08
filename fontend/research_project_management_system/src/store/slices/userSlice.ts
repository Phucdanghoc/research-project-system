import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

interface AccountState {
  users: User[];
  loading: boolean;
  error: string | null;
}

interface PasswordChangePayload {
  oldPassword: string;
  currentPassword: string;
}

const initialState: AccountState = {
  users: [],
  loading: false,
  error: null,
};


export const updateUserAsync = createAsyncThunk<User, User & { password?: string }, { rejectValue: string }>(
  'accounts/updateUser',
  async (user, { rejectWithValue }) => {
    try {
      const response = await api.put<User>(`/users/${user.id}`, user);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);


export const changePasswordAsync = createAsyncThunk<void, PasswordChangePayload, { rejectValue: string }>(
  'accounts/changePassword',
  async ({ oldPassword, currentPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/change-password', { oldPassword, currentPassword });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const resetPasswordAsync = createAsyncThunk<void, string, { rejectValue: string }>(
  'accounts/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/reset-password', { email });
      return response.data;
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
    const handleAsync = <T>(
      builder: any,
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
        .addCase(action.rejected, (state: AccountState, action: { payload: string }) => {
          state.loading = false;
          state.error = action.payload;
        });
    };
    handleAsync<User>(builder, updateUserAsync, (state, action) => {
      state.users = state.users.map((user) =>
        user.id === action.payload.id ? action.payload : user
      );
    });
    handleAsync<void>(builder, changePasswordAsync, () => { });
    handleAsync<void>(builder, resetPasswordAsync, () => { });
  },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;