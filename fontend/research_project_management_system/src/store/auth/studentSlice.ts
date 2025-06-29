import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
    // baseURL: 'http://localhost:3000/api/v1/users/students',
    baseURL: 'http://localhost:3000/api/v1/users',
});

api.defaults.headers.common['Authorization'] = 'Bearer ' + TokenService.getToken();

export const fetchStudentsAsync = createAsyncThunk(
    'students/fetchStudentsAsync',
    async ({ page = 1, per_page = 10 }: { page: number; per_page: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/students`, {
                params: {
                    page,
                    per_page,
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Lấy danh sách sinh viên thất bại';
            return rejectWithValue(errorMessage);
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Lấy danh sách sinh viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }

)

export const searchStudentsAsync = createAsyncThunk(
    'students/searchStudentsAsync',
    async ({ keyword, page = 1, per_page = 10 }: { keyword: string ; page: number; per_page: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/students/search`, {
                params: {
                    keyword,
                    page,
                    per_page,
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Lấy danh sách sinh viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
)

export const addStudentAsync = createAsyncThunk(
    'students/addStudentAsync',
    async (student: Omit<User, 'id'> & { password?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('', {user : student});
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Thêm sinh viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateStudentAsync = createAsyncThunk(
    'students/updateStudentAsync',
    async (student: User & { password?: string }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/${student.id}`, student);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Cập nhật sinh viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteStudentAsync = createAsyncThunk(
    'students/deleteStudentAsync',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/${id}`);
            return id;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Xóa sinh viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

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

const studentSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.users || [];
                state.current_page = action.payload.current_page;
                state.total_pages = action.payload.total_pages;
                state.total_count = action.payload.total_count;
                state.error = null;
            })
            .addCase(fetchStudentsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(addStudentAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addStudentAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.students.push(action.payload.user);
                state.error = null;
            })
            .addCase(addStudentAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateStudentAsync.pending, (state) => {
                state.loading = true;
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
            .addCase(updateStudentAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteStudentAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStudentAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.students = state.students.filter((student) => student.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteStudentAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(importStudentsFromExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(importStudentsFromExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.rows_imported = action.payload.count;
                state.error = null;
            })
            .addCase(importStudentsFromExcel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(searchStudentsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.users || [];
                state.current_page = action.payload.current_page;
                state.total_pages = action.payload.total_pages;
                state.total_count = action.payload.total_count;
                state.error = null;
            })
            .addCase(searchStudentsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });


    },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;