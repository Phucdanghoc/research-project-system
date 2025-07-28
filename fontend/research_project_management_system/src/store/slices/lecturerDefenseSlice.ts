import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { TokenService } from '../../services/token';

// Types
interface Lecturer {
  id: number;
  name: string;
  email: string;
}

interface Defense {
  id: number;
  name: string;
  defense_code: string;
}

interface LecturerDefense {
  id: number;
  lecturer_id: number;
  defense_id: number;
  point: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  lecturer: Lecturer;
  defense: Defense;
}

interface LecturerDefenseState {
  lecturerDefenses: LecturerDefense[];
  lecturerDefense: LecturerDefense | null;
  loading: boolean;
  current_page: number;
  total_pages: number;
  total_count: number;
  error: string | null;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface SearchParams extends PaginationParams {
  defense_id?: number;
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/lecturer_defenses',
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

const createLecturerDefenseThunk = (actionType: string, apiCall: (params: any) => Promise<any>) =>
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
export const fetchLecturerDefensesAsync = createLecturerDefenseThunk(
  'lecturerDefenses/fetchLecturerDefensesAsync',
  (params: PaginationParams) => api.get('', { params })
);

export const searchLecturerDefensesAsync = createLecturerDefenseThunk(
  'lecturerDefenses/searchLecturerDefensesAsync',
  (params: SearchParams) => api.get('', { params })
);

export const getLecturerDefenseByIdAsync = createLecturerDefenseThunk(
  'lecturerDefenses/getLecturerDefenseByIdAsync',
  (id: number) => api.get(`/?defense_id=${id}`)
);

export const createLecturerDefenseAsync = createLecturerDefenseThunk(
  'lecturerDefenses/createLecturerDefenseAsync',
  (lecturerDefense: Omit<LecturerDefense, 'id' | 'created_at' | 'updated_at' | 'lecturer' | 'defense'>) =>
    api.post('', { lecturer_defense: lecturerDefense })
);

export const updateLecturerDefenseAsync = createLecturerDefenseThunk(
  'lecturerDefenses/updateLecturerDefenseAsync',
  (lecturerDefense: Partial<LecturerDefense> & { id: number }) =>
    api.patch(`/${lecturerDefense.id}`, { lecturer_defense: lecturerDefense })
);

export const deleteLecturerDefenseAsync = createLecturerDefenseThunk(
  'lecturerDefenses/deleteLecturerDefenseAsync',
  (id: number) => api.delete(`/${id}`)
);

const lecturerDefenseSlice = createSlice({
  name: 'lecturerDefenses',
  initialState: {
    lecturerDefenses: [],
    lecturerDefense: null,
    loading: false,
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    error: null,
  } as LecturerDefenseState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: LecturerDefenseState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: LecturerDefenseState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Operation failed';
    };

    const handleListFulfilled = (state: LecturerDefenseState, action: PayloadAction<any>) => {
      state.loading = false;
      state.lecturerDefenses = action.payload.lecturer_defenses || [];
      state.current_page = action.payload.current_page || 1;
      state.total_pages = action.payload.total_pages || 1;
      state.total_count = action.payload.total_count || 0;
      state.error = null;
    };

    [
      fetchLecturerDefensesAsync,
      searchLecturerDefensesAsync,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListFulfilled)
        .addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(createLecturerDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturerDefenses.push(action.payload.lecturer_defense);
        state.error = null;
      })
      .addCase(createLecturerDefenseAsync.rejected, handleRejected)
      .addCase(updateLecturerDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLecturerDefense = action.payload.lecturer_defense;
        state.lecturerDefenses = state.lecturerDefenses.map((ld) =>
          ld.id === updatedLecturerDefense.id ? updatedLecturerDefense : ld
        );
        state.error = null;
      })
      .addCase(updateLecturerDefenseAsync.rejected, handleRejected)
      .addCase(deleteLecturerDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturerDefenses = state.lecturerDefenses.filter((ld) => ld.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteLecturerDefenseAsync.rejected, handleRejected)
      .addCase(getLecturerDefenseByIdAsync.fulfilled, (state, action) => {
        state.lecturerDefense = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getLecturerDefenseByIdAsync.rejected, handleRejected);
  },
});

export const { clearError } = lecturerDefenseSlice.actions;
export default lecturerDefenseSlice.reducer;