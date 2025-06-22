import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';

const api = axios.create({
  baseURL: '/api',
});
export const fetchUsersAsync = createAsyncThunk(
  'accounts/fetchUsersAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lấy danh sách tài khoản thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addUserAsync = createAsyncThunk(
  'accounts/addUserAsync',
  async (user: Omit<User, 'id'> & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Thêm tài khoản thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateUserAsync = createAsyncThunk(
  'accounts/updateUserAsync',
  async (user: User & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${user.id}`, user);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Cập nhật tài khoản thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);
export const deleteUserAsync = createAsyncThunk(
  'accounts/deleteUserAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Xóa tài khoản thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

interface AccountState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  users: [],
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add user
    builder
      .addCase(addUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload.data);
        state.error = null;
      })
      .addCase(addUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;