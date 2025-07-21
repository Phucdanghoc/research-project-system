import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

// Types
interface StudentState {
  students: User[];
  student: User | null;
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

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
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

const handleApiError = (error: any): string =>
  error.response?.data?.message || 'Operation failed';

const createStudentThunk = (actionType: string, apiCall: (params: any) => Promise<any>) =>
  createAsyncThunk(
    actionType,
    async (params: any, { rejectWithValue }) => {
      try {
        const response = await apiCall(params);
        return response.data;
      } catch (error) {
        return rejectWithValue(handleApiError(error));
      }
    }
  );

// Thunks
export const fetchStudentsAsync = createStudentThunk(
  'students/fetchStudentsAsync',
  (params: PaginationParams) => api.get('/students', { params })
);

export const getStudentInFacultyAsync = createStudentThunk(
  'students/getStudentInFacultyAsync',
  (params: PaginationParams) => api.get('/students/my-faculty', { params })
);

export const searchStudentsAsync = createStudentThunk(
  'students/searchStudentsAsync',
  (params: PaginationParams & { keyword: string }) => api.get('/students/search', { params })
);

export const searchStudentsInFacultyAsync = createStudentThunk(
  'students/searchStudentsInFacultyAsync',
  ({ faculty, ...params }: PaginationParams & { faculty: string; keyword: string }) =>
    api.get(`/students/faculty/search?faculty=${faculty}`, { params })
);

export const addStudentAsync = createStudentThunk(
  'students/addStudentAsync',
  (student: Omit<User, 'id'> & { password?: string }) => api.post('', { user: student })
);

export const updateStudentAsync = createStudentThunk(
  'students/updateStudentAsync',
  (student: User & { password?: string }) => api.put(`/${student.id}`, student)
);

export const deleteStudentAsync = createStudentThunk(
  'students/deleteStudentAsync',
  (id: number) => api.delete(`/${id}`)
);

export const importStudentsFromExcel = createStudentThunk(
  'students/importStudentsFromExcel',
  (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import_csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
);
export const getStudentByIdAsync = createStudentThunk(
  'students/getStudentByIdAsync',
  (id: number) => api.get(`/${id}`)
);

// Slice
const studentSlice = createSlice({
  name: 'students',
  initialState: {
    students: [],
    student: null as User | null,
    current_page: 1,
    rows_imported: 0,
    total_pages: 1,
    total_count: 0,
    loading: false,
    error: null,
  } as StudentState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: StudentState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: StudentState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Operation failed';
    };

    const handleListFulfilled = (state: StudentState, action: PayloadAction<any>) => {
      state.loading = false;
      state.students = action.payload.users || [];
      state.current_page = action.payload.current_page;
      state.total_pages = action.payload.total_pages;
      state.total_count = action.payload.total_count;
      state.error = null;
    };

    [
      fetchStudentsAsync,
      getStudentInFacultyAsync,
      searchStudentsAsync,
      searchStudentsInFacultyAsync,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListFulfilled)
        .addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(addStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload.user);
        state.error = null;
      })
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedStudent = action.payload.user;
        state.students = state.students.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        );
        state.error = null;
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((student) => student.id !== action.payload);
        state.error = null;
      })
      .addCase(importStudentsFromExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.rows_imported = action.payload.count;
        state.error = null;
      })
      .addCase(getStudentByIdAsync.fulfilled, (state, action) => {
        state.student = action.payload;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;