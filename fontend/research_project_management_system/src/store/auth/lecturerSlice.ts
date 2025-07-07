import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

// Types
interface LecturerResponse {
  user: User;
  users?: User[];
  current_page?: number;
  total_pages?: number;
  total_count?: number;
  count?: number;
}

interface LecturerState {
  lecturers: User[];
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
  search?: string;
}
// API Configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

// Thunk Creator Helper
const createLecturerThunk = <T>(
  type: string,
  handler: (params: T) => Promise<any>,
  errorMessage: string
) =>
  createAsyncThunk(
    `lecturers/${type}`,
    async (params: T, { rejectWithValue }) => {
      try {
        const response = await handler(params);
        return response.data as LecturerResponse;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || errorMessage);
      }
    }
  );

// Thunks
export const fetchLecturersAsync = createLecturerThunk(
  'fetchLecturers',
  (params: PaginationParams) => api.get('/lecturers', { params }),
  'Lấy danh sách giảng viên thất bại'
);

export const getLecturerByIdAsync = createLecturerThunk(
  'getLecturerById',
  (id: number) => api.get(`/${id}`),
  'Lấy chi tiết giảng viên thất bại'
);

export const searchLecturersAsync = createLecturerThunk(
  'searchLecturers',
  (params: string) => api.get('/lecturers/search', { params }),
  'Tìm kiếm giảng viên thất bại'
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
  initialState: {
    lecturers: [],
    current_page: 1,
    rows_imported: 0,
    total_pages: 1,
    total_count: 0,
    loading: false,
    error: null,
  } as LecturerState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generic handlers
    const handlePending = (state: LecturerState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: LecturerState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'Đã xảy ra lỗi';
    };

    const handleListResponse = (state: LecturerState, action: PayloadAction<LecturerResponse>) => {
      state.loading = false;
      state.lecturers = action.payload.users || [];
      state.current_page = action.payload.current_page || 1;
      state.total_pages = action.payload.total_pages || 1;
      state.total_count = action.payload.total_count || 0;
      state.error = null;
    };

    // Add cases for all thunks
    [fetchLecturersAsync, searchLecturersAsync].forEach(thunk => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListResponse)
        .addCase(thunk.rejected, handleRejected);
    });

    // Handle specific cases
    builder
      .addCase(getLecturerByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.lecturers = [action.payload.user];
        }
        state.error = null;
      });
  },
});

export const { clearError } = lecturerSlice.actions;
export default lecturerSlice.reducer;

function handleApiError(error: unknown, arg1: string): unknown {
  throw new Error('Function not implemented.');
}
