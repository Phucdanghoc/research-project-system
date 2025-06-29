import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/users',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

interface StudentState {
  students: User[];
  loading: boolean;
  current_page: number;
  total_pages: number;
  rows_imported: number;
  total_count: number;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
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

interface FacultyParams extends PaginationParams {
  faculty: string;
}

interface SearchParams extends FacultyParams {
  keyword: string;
}

// Helper function to handle API errors
const handleApiError = (error: any): string =>
  error.response?.data?.message || 'Operation failed';

// Thunks
export const fetchStudentsAsync = createAsyncThunk(
  'students/fetchStudentsAsync',
  async ({ page = 1, per_page = 10 }: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/students', { params: { page, per_page } });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const getStudentInFacultyAsync = createAsyncThunk(
  'students/getStudentInFacultyAsync',
  async ({ faculty, page = 1, per_page = 10 }: FacultyParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/faculty?faculty=${faculty}`, {
        params: { page, per_page },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const searchStudentsInFacultyAsync = createAsyncThunk(
  'students/searchStudentsInFacultyAsync',
  async ({ faculty, keyword, page = 1, per_page = 10 }: SearchParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/faculty/search?faculty=${faculty}`, {
        params: { keyword, page, per_page },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const importStudentsFromExcel = createAsyncThunk(
  'students/importStudentsFromExcel',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/import_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const searchStudentsAsync = createAsyncThunk(
  'students/searchStudentsAsync',
  async ({ keyword, page = 1, per_page = 10 }: PaginationParams & { keyword: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/search', { params: { keyword, page, per_page } });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const addStudentAsync = createAsyncThunk(
  'students/addStudentAsync',
  async (student: Omit<User, 'id'> & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('', { user: student });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateStudentAsync = createAsyncThunk(
  'students/updateStudentAsync',
  async (student: User & { password?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/${student.id}`, student);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteStudentAsync = createAsyncThunk(
  'students/deleteStudentAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Common reducer handlers
    const handlePending = (state: StudentState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: StudentState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    const handleListFulfilled = (state: StudentState, action: any) => {
      state.loading = false;
      state.students = action.payload.users || [];
      state.current_page = action.payload.current_page;
      state.total_pages = action.payload.total_pages;
      state.total_count = action.payload.total_count;
      state.error = null;
    };

    // Fetch students
    builder
      .addCase(fetchStudentsAsync.pending, handlePending)
      .addCase(fetchStudentsAsync.fulfilled, handleListFulfilled)
      .addCase(fetchStudentsAsync.rejected, handleRejected);

    // Get students in faculty
    builder
      .addCase(getStudentInFacultyAsync.pending, handlePending)
      .addCase(getStudentInFacultyAsync.fulfilled, handleListFulfilled)
      .addCase(getStudentInFacultyAsync.rejected, handleRejected);

    // Search students in faculty
    builder
      .addCase(searchStudentsInFacultyAsync.pending, handlePending)
      .addCase(searchStudentsInFacultyAsync.fulfilled, handleListFulfilled)
      .addCase(searchStudentsInFacultyAsync.rejected, handleRejected);

    // Search students
    builder
      .addCase(searchStudentsAsync.pending, handlePending)
      .addCase(searchStudentsAsync.fulfilled, handleListFulfilled)
      .addCase(searchStudentsAsync.rejected, handleRejected);

    // Add student
    builder
      .addCase(addStudentAsync.pending, handlePending)
      .addCase(addStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload.user);
        state.error = null;
      })
      .addCase(addStudentAsync.rejected, handleRejected);

    // Update student
    builder
      .addCase(updateStudentAsync.pending, handlePending)
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedStudent = action.payload.user;
        state.students = state.students.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        );
        state.error = null;
      })
      .addCase(updateStudentAsync.rejected, handleRejected);

    // Delete student
    builder
      .addCase(deleteStudentAsync.pending, handlePending)
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((student) => student.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStudentAsync.rejected, handleRejected);

    // Import students
    builder
      .addCase(importStudentsFromExcel.pending, handlePending)
      .addCase(importStudentsFromExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.rows_imported = action.payload.count;
        state.error = null;
      })
      .addCase(importStudentsFromExcel.rejected, handleRejected);
  },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;