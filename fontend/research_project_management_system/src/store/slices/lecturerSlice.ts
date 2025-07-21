import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

// Types
interface LecturerState {
  lecturers: User[];
  lecturer: User | null;
  loading: boolean;
  current_page: number;
  total_pages: number;
  rows_imported: number;
  total_count: number;
  error: string | null;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface SearchParams extends PaginationParams {
  keyword: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
});

// Add request interceptor to set Authorization header dynamically
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

const createLecturerThunk = (actionType: string, apiCall: (params: any) => Promise<any>) =>
  createAsyncThunk(actionType, async (params: any, { rejectWithValue }) => {
    try {
      const response = await apiCall(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  });

// Thunks
export const fetchLecturersAsync = createLecturerThunk(
  'lecturers/fetchLecturersAsync',
  ({ page = 1, per_page = 10 }: PaginationParams) =>
    api.get('/lecturers', { params: { page, per_page } })
);

export const getLecturerByIdAsync = createLecturerThunk(
  'lecturers/getLecturerByIdAsync',
  (id: number) => api.get(`/${id}`)
);

export const searchLecturersAsync = createLecturerThunk(
  'lecturers/searchLecturersAsync',
  ({ keyword, page = 1, per_page = 10 }: SearchParams) =>
    api.get('/lecturers/search', { params: { keyword, page, per_page } })
);

export const importLecturersFromExcel = createLecturerThunk(
  'lecturers/importLecturersFromExcel',
  (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import_csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
);

export const addLecturerAsync = createLecturerThunk(
  'lecturers/addLecturerAsync',
  (lecturer: Omit<User, 'id'> & { password?: string }) =>
    api.post('/', { user: lecturer })
);

export const updateLecturerAsync = createLecturerThunk(
  'lecturers/updateLecturerAsync',
  (lecturer: User & { password?: string }) =>
    api.put(`/${lecturer.id}`, { user: lecturer })
);

export const deleteLecturerAsync = createLecturerThunk(
  'lecturers/deleteLecturerAsync',
  (id: number) => api.delete(`/${id}`)
);

// Slice
const lecturerSlice = createSlice({
  name: 'lecturers',
  initialState: {
    lecturers: [],
    lecturer: null,
    loading: false,
    current_page: 1,
    total_pages: 1,
    rows_imported: 0,
    total_count: 0,
    error: null,
  } as LecturerState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: LecturerState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: LecturerState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload ?? 'Unknown error';
    };


    const handleListFulfilled = (
      state: LecturerState,
      action: PayloadAction<{
        users: User[];
        current_page: number;
        total_pages: number;
        total_count: number;
      }>
    ) => {
      state.loading = false;
      state.lecturers = action.payload.users || [];
      state.current_page = action.payload.current_page || 1;
      state.total_pages = action.payload.total_pages || 1;
      state.total_count = action.payload.total_count || 0;
      state.error = null;
    };

    [fetchLecturersAsync, searchLecturersAsync].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListFulfilled)
        .addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(getLecturerByIdAsync.pending, handlePending)
      .addCase(
        getLecturerByIdAsync.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.lecturer = action.payload.user;
          state.error = null;
        }
      )
      .addCase(getLecturerByIdAsync.rejected, handleRejected);

    builder
      .addCase(importLecturersFromExcel.pending, handlePending)
      .addCase(importLecturersFromExcel.fulfilled, (state, action: PayloadAction<{ count: number }>) => {
        state.loading = false;
        state.rows_imported = action.payload.count;
        state.error = null;
      })
      .addCase(importLecturersFromExcel.rejected, handleRejected);

    builder
      .addCase(addLecturerAsync.pending, handlePending)
      .addCase(addLecturerAsync.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.loading = false;
        state.lecturers.push(action.payload.user);
        state.error = null;
      })
      .addCase(addLecturerAsync.rejected, handleRejected);

    builder
      .addCase(updateLecturerAsync.pending, handlePending)
      .addCase(updateLecturerAsync.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.loading = false;
        const updatedLecturer = action.payload.user;
        state.lecturers = state.lecturers.map((lecturer) =>
          lecturer.id === updatedLecturer.id ? updatedLecturer : lecturer
        );
        state.error = null;
      })
      .addCase(updateLecturerAsync.rejected, handleRejected);

    builder
      .addCase(deleteLecturerAsync.pending, handlePending)
      .addCase(deleteLecturerAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.lecturers = state.lecturers.filter((lecturer) => lecturer.id !== action.payload);
        state.error = null;
      })
  },
});

export const { clearError } = lecturerSlice.actions;
export default lecturerSlice.reducer;