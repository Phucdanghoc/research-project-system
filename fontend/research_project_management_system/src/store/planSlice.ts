import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface Plan {
  id: string;
  projectCode: string;
  instructorId: string;
  studentCount: number;
}

interface PlanState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

const mockPlans: Plan[] = [
  { id: '1', projectCode: 'CTN.2425.K3.001', instructorId: 'CTI061', studentCount: 3 },
  { id: '2', projectCode: 'CTN.2425.K3.002', instructorId: 'CTI072', studentCount: 3 },
  { id: '3', projectCode: 'CTN.2425.K3.003', instructorId: 'CTI062', studentCount: 2 },
];


const mockApi = {
  getPlans: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); 
    return mockPlans;
  },
  addPlan: async (plan: Omit<Plan, 'id'>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newPlan = { ...plan, id: `${Date.now()}` }; 
    mockPlans.push(newPlan);
    return newPlan;
  },
  updatePlan: async (plan: Plan) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockPlans.findIndex((p) => p.id === plan.id);
    if (index === -1) throw new Error('Plan not found');
    mockPlans[index] = plan;
    return plan;
  },
  deletePlan: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockPlans.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Plan not found');
    mockPlans.splice(index, 1);
    return id;
  },
};


export const fetchPlans = createAsyncThunk<Plan[], void, { rejectValue: string }>(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockApi.getPlans();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch plans');
    }
  }
);

export const addPlan = createAsyncThunk<Plan, Omit<Plan, 'id'>, { rejectValue: string }>(
  'plans/addPlan',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await mockApi.addPlan(plan);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add plan');
    }
  }
);

export const updatePlan = createAsyncThunk<Plan, Plan, { rejectValue: string }>(
  'plans/updatePlan',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await mockApi.updatePlan(plan);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update plan');
    }
  }
);

export const deletePlan = createAsyncThunk<string, string, { rejectValue: string }>(
  'plans/deletePlan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mockApi.deletePlan(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete plan');
    }
  }
);


const initialState: PlanState = {
  plans: [],
  loading: false,
  error: null,
};


const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch plans';
      })
      
      .addCase(addPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
      })
      .addCase(addPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add plan';
      })
      
      .addCase(updatePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.plans.findIndex((plan) => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update plan';
      })
      
      .addCase(deletePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete plan';
      });
  },
});

export default planSlice.reducer;