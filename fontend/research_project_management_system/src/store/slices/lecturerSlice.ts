import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

interface LecturerState {
  lecturers: User[];
  loading: boolean;
  current_page: number;
  total_pages: number;
  rows_imported: number;
  total_count: number;
  error: string | null;
}

const initialState: LecturerState = {
  lecturers: [],
  current_page: 1,
  rows_imported: 0,
  total_pages: 1,
  total_count: 0,
  loading: false,
  error: null,
};

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface SearchParams extends PaginationParams {
  keyword: string;
}

// Helper function to handle API errors
const handleApiError = (error: any, defaultMessage: string): string =>
  error.response?.data?.message || defaultMessage;

// Thunks
export const fetchLecturersAsync = createAsyncThunk(
  'lecturers/fetchLecturersAsync',
  async ({ page = 1, per_page = 10 }: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/lecturers', { params: { page, per_page } });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Lấy danh sách giảng viên thất bại'));
    }
  }
);


export const getLecturerByIdAsync = createAsyncThunk(
  'lecturers/getLecturerByIdAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Lấy chi tiết giảng viên thất bại'));
    }
  }
);

export const searchLecturersAsync = createAsyncThunk(
  'lecturers/searchLecturersAsync',
  async ({ keyword, page = 1, per_page = 10 }: SearchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/lecturers/search', { params: { keyword, page, per_page } });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Tìm kiếm giảng viên thất bại'));
    }
  }
);
export const importLecturersFromExcel = createAsyncThunk(
  'lecturers/importLecturersFromExcel',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/import_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Nhập danh sách giảng viên từ Excel thất bại'));
    }
  }
);

export const addLecturerAsync = createAsyncThunk(
  'lecturers/addLecturerAsync',
  async (lecturer: Omit<User, 'id'> & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/', { user: lecturer });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Thêm giảng viên thất bại'));
    }
  }
);

export const updateLecturerAsync = createAsyncThunk(
  'lecturers/updateLecturerAsync',
  async (lecturer: User & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/${lecturer.id}`, lecturer);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Cập nhật giảng viên thất bại'));
    }
  }
);

export const deleteLecturerAsync = createAsyncThunk(
  'lecturers/deleteLecturerAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Xóa giảng viên thất bại'));
    }
  }
);

const lecturerSlice = createSlice({
  name: 'lecturers',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Common reducer handlers
    const handlePending = (state: LecturerState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: LecturerState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    const handleListFulfilled = (state: LecturerState, action: any) => {
      state.loading = false;
      state.lecturers = action.payload.users || [];
      state.current_page = action.payload.current_page;
      state.total_pages = action.payload.total_pages;
      state.total_count = action.payload.total_count;
      state.error = null;
    };

    builder
      .addCase(fetchLecturersAsync.pending, handlePending)
      .addCase(fetchLecturersAsync.fulfilled, handleListFulfilled)
      .addCase(fetchLecturersAsync.rejected, handleRejected);

    builder
      .addCase(getLecturerByIdAsync.pending, handlePending)
      .addCase(getLecturerByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturers = [action.payload.user]; 
        state.error = null;
      })
      .addCase(getLecturerByIdAsync.rejected, handleRejected);

    builder
      .addCase(searchLecturersAsync.pending, handlePending)
      .addCase(searchLecturersAsync.fulfilled, handleListFulfilled)
      .addCase(searchLecturersAsync.rejected, handleRejected);

    builder
      .addCase(importLecturersFromExcel.pending, handlePending)
      .addCase(importLecturersFromExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.rows_imported = action.payload.count;
        state.error = null;
      })
      .addCase(importLecturersFromExcel.rejected, handleRejected);

    builder
      .addCase(addLecturerAsync.pending, handlePending)
      .addCase(addLecturerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturers.push(action.payload.user);
        state.error = null;
      })
      .addCase(addLecturerAsync.rejected, handleRejected);
    builder
      .addCase(updateLecturerAsync.pending, handlePending)
      .addCase(updateLecturerAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLecturer = action.payload.user;
        state.lecturers = state.lecturers.map((lecturer) =>
          lecturer.id === updatedLecturer.id ? updatedLecturer : lecturer
        );
        state.error = null;
      })
      .addCase(updateLecturerAsync.rejected, handleRejected);

    // Delete lecturer
    builder
      .addCase(deleteLecturerAsync.pending, handlePending)
      .addCase(deleteLecturerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturers = state.lecturers.filter((lecturer) => lecturer.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteLecturerAsync.rejected, handleRejected);
  },
});

export const { clearError } = lecturerSlice.actions;
export default lecturerSlice.reducer;