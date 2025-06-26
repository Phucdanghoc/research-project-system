import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types/user';
import { TokenService } from '../../services/token';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1/users',
});

api.defaults.headers.common['Authorization'] = 'Bearer ' + TokenService.getToken();

export const fetchLecturersAsync = createAsyncThunk(
    'lecturers/fetchLecturersAsync',
    async ({ page = 1, per_page = 10 }: { page: number; per_page: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/lecturers`, {
                params: {
                    page,
                    per_page,
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Lấy danh sách giảng viên thất bại';
            return rejectWithValue(errorMessage);
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Nhập danh sách giảng viên từ Excel thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const searchLecturersAsync = createAsyncThunk(
    'lecturers/searchLecturersAsync',
    async ({ keyword, page = 1, per_page = 10 }: { keyword: string; page: number; per_page: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/lecturers/search`, {
                params: {
                    keyword,
                    page,
                    per_page,
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Tìm kiếm giảng viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const addLecturerAsync = createAsyncThunk(
    'lecturers/addLecturerAsync',
    async (lecturer: Omit<User, 'id'> & { password?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/', lecturer);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Thêm giảng viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateLecturerAsync = createAsyncThunk(
    'lecturers/updateLecturerAsync',
    async (lecturer: User & { password?: string }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/${lecturer.id}`, lecturer);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Cập nhật giảng viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteLecturerAsync = createAsyncThunk(
    'lecturers/deleteLecturerAsync',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/${id}`);
            return id;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Xóa giảng viên thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

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

const lecturerSlice = createSlice({
    name: 'lecturers',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLecturersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLecturersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.lecturers = action.payload.users || [];
                state.current_page = action.payload.current_page;
                state.total_pages = action.payload.total_pages;
                state.total_count = action.payload.total_count;
                state.error = null;
            })
            .addCase(fetchLecturersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(addLecturerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addLecturerAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.lecturers.push(action.payload.user);
                state.error = null;
            })
            .addCase(addLecturerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateLecturerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLecturerAsync.fulfilled, (state, action) => {
                state.loading = false;
                const updatedLecturer = action.payload.user;
                state.lecturers = state.lecturers.map((lecturer) =>
                    lecturer.id === updatedLecturer.id ? updatedLecturer : lecturer
                );
                state.error = null;
            })
            .addCase(updateLecturerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteLecturerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLecturerAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.lecturers = state.lecturers.filter((lecturer) => lecturer.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteLecturerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(importLecturersFromExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(importLecturersFromExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.rows_imported = action.payload.count;
                state.error = null;
            })
            .addCase(importLecturersFromExcel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(searchLecturersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchLecturersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.lecturers = action.payload.users || [];
                state.current_page = action.payload.current_page;
                state.total_pages = action.payload.total_pages;
                state.total_count = action.payload.total_count;
                state.error = null;
            })
            .addCase(searchLecturersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = lecturerSlice.actions;
export default lecturerSlice.reducer;