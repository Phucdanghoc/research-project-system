import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { TokenService } from '../../services/token';
import type { Defense } from '../../types/defense';

// Types
interface DefenseState {
  defenses: Defense[];
  defense: Defense | null;
  loading: boolean;
  current_page: number;
  total_pages: number;
  total_count: number;
  error: string | null;
  timeCheck: { available: boolean } | null;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface SearchParams extends PaginationParams {
  keyword?: string;
  defense_code?: string;
  start_time?: string;
  end_time?: string;
}

interface TimeCheckParams {
  lecturer_id: number;
  start_time: string;
  end_time: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/defenses',
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

const createDefenseThunk = (actionType: string, apiCall: (params: any) => Promise<any>) =>
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
export const fetchDefensesAsync = createDefenseThunk(
  'defenses/fetchDefensesAsync',
  (params: PaginationParams) => api.get('', { params })
);

export const searchDefensesAsync = createDefenseThunk(
  'defenses/searchDefensesAsync',
  (params: SearchParams) => api.get('/search', { params })
);

export const getMyDefensesAsync = createDefenseThunk(
  'defenses/getMyDefensesAsync',
  () => api.get('/my_defense')
);

export const checkDefenseTimeAsync = createDefenseThunk(
  'defenses/checkDefenseTimeAsync',
  (params: TimeCheckParams) => api.get('/check_time', { params })
);

export const getDefenseByIdAsync = createDefenseThunk(
  'defenses/getDefenseByIdAsync',
  (id: number) => api.get(`/${id}`)
);

export const addDefenseAsync = createDefenseThunk(
  'defenses/addDefenseAsync',
  (defense: Omit<Defense, 'id'>) => api.post('', { defense })
);

export const updateDefenseAsync = createDefenseThunk(
  'defenses/updateDefenseAsync',
  (defense: Partial<Defense> & { id: number }) => api.patch(`/${defense.id}`, { defense })
);

export const deleteDefenseAsync = createDefenseThunk(
  'defenses/deleteDefenseAsync',
  (id: number) => api.delete(`/${id}`)
);

const defenseSlice = createSlice({
  name: 'defenses',
  initialState: {
    defenses: [],
    defense: null,
    loading: false,
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    error: null,
    timeCheck: null,
  } as DefenseState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTimeCheck: (state) => {
      state.timeCheck = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: DefenseState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: DefenseState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Operation failed';
    };

    const handleListFulfilled = (state: DefenseState, action: PayloadAction<any>) => {
      state.loading = false;
      state.defenses = action.payload.defenses || [];
      state.current_page = action.payload.current_page || 1;
      state.total_pages = action.payload.total_pages || 1;
      state.total_count = action.payload.total_count || 0;
      state.error = null;
    };

    [
      fetchDefensesAsync,
      searchDefensesAsync,
      getMyDefensesAsync,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListFulfilled)
        .addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(addDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.defenses.push(action.payload.defense);
        state.error = null;
      })
      .addCase(updateDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDefense = action.payload.defense;
        state.defenses = state.defenses.map((defense) =>
          defense.id === updatedDefense.id ? updatedDefense : defense
        );
        state.error = null;
      })
      .addCase(deleteDefenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.defenses = state.defenses.filter((defense) => defense.id !== action.payload);
        state.error = null;
      })
      .addCase(getDefenseByIdAsync.fulfilled, (state, action) => {
        state.defense = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkDefenseTimeAsync.fulfilled, (state, action) => {
        state.timeCheck = action.payload;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, clearTimeCheck } = defenseSlice.actions;
export default defenseSlice.reducer;