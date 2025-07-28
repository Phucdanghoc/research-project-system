import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { TokenService } from '../../services/token';
import type { Plan } from '../../types/plan';

// Types
interface PlanState {
  plans: Plan[];
  plan: Plan | null;
  loading: boolean;
  current_page: number;
  total_pages: number;
  total_count: number;
  check_time: boolean;
  error: string | null;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
  start_time?: string;
  end_time?: string;
}


interface SearchParams extends PaginationParams {
  keyword?: string;
  group_id?: number;
  defense_id?: number;
  date?: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/plans',
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

const createPlanThunk = (actionType: string, apiCall: (params: any) => Promise<any>) =>
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
export const fetchPlansAsync = createPlanThunk(
  'plans/fetchPlansAsync',
  (params: PaginationParams) => api.get('', { params })
);

export const searchPlansAsync = createPlanThunk(
  'plans/searchPlansAsync',
  (params: SearchParams) => api.get('/search', { params })
);

export const getPlanByIdAsync = createPlanThunk(
  'plans/getPlanByIdAsync',
  (id: number) => api.get(`/${id}`)
);

export const createPlanAsync = createPlanThunk(
  'plans/createPlanAsync',
  (plan: Omit<Plan, 'id'>) => api.post('', { plan })
);

export const updatePlanAsync = createPlanThunk(
  'plans/updatePlanAsync',
  (plan: Partial<Plan> & { id: number }) => api.patch(`/${plan.id}`, { plan })
);
export const fetchPlansByMeAsync = createPlanThunk(
  'plans/fetchPlansByMeAsync',
  (params: PaginationParams) => api.get('/me', { params })
);

export const checkPlanTimeAsync = createAsyncThunk(
  'defense/checkTime',
  async ({ lecturerIds, startTime, endTime , date }: {
    lecturerIds: number[];
    startTime: string;
    endTime: string;
    date: string;
  }, { rejectWithValue }) => {
    try {
      for (const lecturerId of lecturerIds) {
        const response = await api.get('/check_time', {
          params: { lecturer_id: lecturerId, start_time: startTime, end_time: endTime , date },
        });
        if (!response.data) {
          return false; // Có người không rảnh
        }
      }
      return true; 
    } catch (error: any) {
      console.log(error);
      
      return rejectWithValue(error?.response?.data?.message || 'Lỗi kiểm tra thời gian giảng viên');
    }
  }
);


export const deletePlanAsync = createPlanThunk(
  'plans/deletePlanAsync',
  (id: number) => api.delete(`/${id}`)
);

const planSlice = createSlice({
  name: 'plans',
  initialState: {
    plans: [],
    plan: null,
    loading: false,
    current_page: 1,
    check_time: false,
    total_pages: 1,
    total_count: 0,
    error: null,
  } as PlanState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: PlanState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: PlanState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Operation failed';
    };

    const handleListFulfilled = (state: PlanState, action: PayloadAction<any>) => {
      state.loading = false;
      state.plans = action.payload.plans || [];
      state.current_page = action.payload.current_page || 1;
      state.total_pages = action.payload.total_pages || 1;
      state.total_count = action.payload.total_count || 0;
      state.error = null;
    };

    [
      fetchPlansAsync,
      searchPlansAsync,
      fetchPlansByMeAsync,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleListFulfilled)
        .addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(createPlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload.plan);
        state.error = null;
      })
      .addCase(createPlanAsync.rejected, handleRejected)
      .addCase(updatePlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPlan = action.payload.plan;
        state.plans = state.plans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        );
        state.error = null;
      })
      .addCase(deletePlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
        state.error = null;
      })
      .addCase(getPlanByIdAsync.fulfilled, (state, action) => {
        state.plan = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkPlanTimeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.check_time = action.payload as boolean;
        state.error = null;
      })
      .addCase(checkPlanTimeAsync.rejected, handleRejected);
  },
});

export const { clearError } = planSlice.actions;
export default planSlice.reducer;