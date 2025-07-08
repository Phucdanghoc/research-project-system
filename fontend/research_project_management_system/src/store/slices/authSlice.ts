import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { UserLogin } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
});

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: UserLogin, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', { user: credentials });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);


export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      api.defaults.headers.common['Authorization'] = 'Bearer ' + TokenService.getToken();
      const response = await api.delete('/logout');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      return rejectWithValue(errorMessage);
    }
  }
)

export const verifyTokenAsync = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = TokenService.getToken();
      if (!token) {
        throw new Error('Không tìm thấy token');
      }
      const response = await api.post(
        '/verify_token',
        {
          token,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Xác thực thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      TokenService.setToken(action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      TokenService.removeToken();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        TokenService.setToken(action.payload.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyTokenAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        TokenService.removeToken();
      });
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;