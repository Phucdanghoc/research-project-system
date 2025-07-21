import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

// Types
interface AccountState {
  users: User[];
  profile: User | null;
  loading: boolean;
  error: string | null;
}

interface PasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = (error: unknown): string =>
  axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : 'Operation failed';

interface ThunkConfig {
  rejectValue: string;
}

const createAccountThunk = <T, Arg>(
  actionType: string,
  apiCall: (params: Arg) => Promise<any>
) =>
  createAsyncThunk<T, Arg, ThunkConfig>(actionType, async (params, { rejectWithValue }) => {
    try {
      const response = await apiCall(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  });

// Thunks
export const updateUserAsync = createAccountThunk<User, User & { password?: string }>(
  'accounts/updateUser',
  (user) => api.put(`/users/${user.id}`, { user })
);

export const getProfileAsync = createAccountThunk<User, void>(
  'accounts/getProfile',
  () => api.get('/users/profile')
);

export const changePasswordAsync = createAccountThunk<void, PasswordChangePayload>(
  'accounts/changePassword',
  ({ oldPassword, newPassword }) =>
    api.post('/users/change-password', { current_password: oldPassword, new_password: newPassword })
);

export const resetPasswordAsync = createAccountThunk<void, string>(
  'accounts/resetPassword',
  (email) => api.post('/users/reset-password', { email })
);

// Slice
const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    users: [],
    profile: null,
    loading: false,
    error: null,
  } as AccountState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AccountState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: AccountState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(updateUserAsync.pending, handlePending)
      .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex((user) => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        } else {
          state.users.push(updatedUser);
        }
        if (state.profile?.id === updatedUser.id) {
          state.profile = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, handleRejected);

    builder
      .addCase(getProfileAsync.pending, handlePending)
      .addCase(getProfileAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getProfileAsync.rejected, handleRejected);

    builder
      .addCase(changePasswordAsync.pending, handlePending)
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, handleRejected);

    builder
      .addCase(resetPasswordAsync.pending, handlePending)
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordAsync.rejected, handleRejected);
  },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;