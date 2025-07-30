import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Group, GroupDetail, GroupForm } from '../../types/group';
import { TokenService } from '../../services/token';

// Types
interface GroupState {
    groups: Group[];
    group: GroupDetail | null;
    loading: boolean;
    current_page: number;
    total_pages: number;
    error: string | null;
}

interface PaginationParams {
    page?: number;
    per_page?: number;
    keyword?: string;
    status?: string;
}

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
});

// Add request interceptor to set Authorization header dynamically
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

const handleApiError = (error: unknown): string =>
    axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Operation failed';

// Define thunk configuration
interface ThunkConfig {
    rejectValue: string;
}

const createGroupThunk = <T, Arg>(
    actionType: string,
    apiCall: (params: Arg) => Promise<any>
) =>
    createAsyncThunk<T, Arg, ThunkConfig>(actionType, async (params, { rejectWithValue }) => {
        try {
            const response = await apiCall(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    });

// Thunks
export const createGroupAsync = createGroupThunk<{ group: Group }, GroupForm>(
    'groups/createGroupAsync',
    ({ name, topic_id, student_ids , description }) =>
        api.post('/groups', { name, topic_id, student_ids , description })
);

export const fetchGroupsAsync = createGroupThunk<
    { groups: Group[]; current_page: number; total_pages: number },
    PaginationParams
>(
    'groups/fetchGroupsAsync',
    ({ page = 1, per_page = 10, keyword = '', status = '' }) =>
        api.get('/groups', { params: { page, per_page, keyword, status } })
);

export const updateGroupStatusAsync = createGroupThunk<{ group: Group }, { id: number; status: string }>(
    'groups/updateGroupStatusAsync',
    ({ id, status }) => api.patch(`/groups/${id}`, { group: { status } })
);
export const updateGroupDefenseStatusByMeAsync = createGroupThunk<{ group: Group }, { id: number; status: string }>(
    'groups/updateGroupDefenseStatusByMeAsync',
    ({ id, status }) => api.patch(`/groups/${id}`, { group: { def_status: status } })
);

export const updateGroupAsync = createGroupThunk<{ group: Group }, { id: number; groupData: GroupForm }>(
    'groups/updateGroupAsync',
    ({ id, groupData }) =>
        api.put(`/groups/${id}`, {
            group: {
                name: groupData.name,
                student_ids: groupData.student_ids,
                student_lead_id: parseInt(groupData.student_lead_id as unknown as string),
                description: groupData.description,
            },
        })
);

export const deleteGroupAsync = createGroupThunk<number, number>(
    'groups/deleteGroupAsync',
    (id) => api.delete(`/groups/${id}`)
);

export const getGroupAsync = createGroupThunk<GroupDetail, number>(
    'groups/getGroupAsync',
    (id) => api.get(`/groups/${id}`)
);
export const patchGroupAsync = createGroupThunk<{ group: Group }, { id: number; def_status: string }>(
    'groups/patchGroupAsync',
    ({ id, def_status }) =>
        api.patch(`/groups/${id}`, {
            group: {
                def_status: def_status,
            },
        })
);

export const fetchGroupByMeAsync = createGroupThunk<
    { groups: Group[]; current_page: number; total_pages: number },
    PaginationParams
>(
    'groups/fetchGroupByMeAsync',
    ({ page = 1, per_page = 10, status = '', keyword = '' }) =>
        api.get('/users/groups/me', { params: { page, per_page, status, keyword } })
);

export const searchGroupsAsync = createGroupThunk<
    { groups: Group[]; current_page: number; total_pages: number },
    string
>(
    'groups/searchGroupsAsync',
    (keyword) => api.get('/groups/search', { params: { keyword } })
);

// Slice
const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        groups: [],
        group: null,
        loading: false,
        current_page: 1,
        total_pages: 0,
        error: null,
    } as GroupState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state: GroupState) => {
            state.loading = true;
            state.error = null;
        };

        const handleRejected = (state: GroupState, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload;
        };

        const handleListFulfilled = (
            state: GroupState,
            action: PayloadAction<{ groups: Group[]; current_page: number; total_pages: number }>
        ) => {
            state.loading = false;
            state.groups = action.payload.groups || [];
            state.current_page = action.payload.current_page || 1;
            state.total_pages = action.payload.total_pages || 0;
            state.error = null;
        };

        [fetchGroupsAsync, fetchGroupByMeAsync, searchGroupsAsync].forEach((thunk) => {
            builder
                .addCase(thunk.pending, handlePending)
                .addCase(thunk.fulfilled, handleListFulfilled)
                .addCase(thunk.rejected, handleRejected);
        });

        builder
            .addCase(createGroupAsync.pending, handlePending)
            .addCase(createGroupAsync.fulfilled, (state, action: PayloadAction<{ group: Group }>) => {
                state.loading = false;
                state.groups.push(action.payload.group);
                state.error = null;
            })
            .addCase(createGroupAsync.rejected, handleRejected);

        builder
            .addCase(updateGroupStatusAsync.pending, handlePending)
            .addCase(
                updateGroupStatusAsync.fulfilled,
                (state, action: PayloadAction<{ group: Group }>) => {
                    state.loading = false;
                    state.groups = state.groups.map((group) =>
                        group.id === action.payload.group.id ? action.payload.group : group
                    );
                    state.error = null;
                }
            )
            .addCase(updateGroupStatusAsync.rejected, handleRejected);
        builder
            .addCase(updateGroupDefenseStatusByMeAsync.pending, handlePending)
            .addCase(
                updateGroupDefenseStatusByMeAsync.fulfilled,
                (state, action: PayloadAction<{ group: Group }>) => {
                    state.loading = false;
                    state.groups = state.groups.map((group) =>
                        group.id === action.payload.group.id ? action.payload.group : group
                    );
                    state.error = null;
                }
            )
            .addCase(updateGroupDefenseStatusByMeAsync.rejected, handleRejected);


        builder
            .addCase(updateGroupAsync.pending, handlePending)
            .addCase(updateGroupAsync.fulfilled, (state, action: PayloadAction<{ group: Group }>) => {
                state.loading = false;
                state.groups = state.groups.map((group) =>
                    group.id === action.payload.group.id ? action.payload.group : group
                );
                state.error = null;
            })
            .addCase(updateGroupAsync.rejected, handleRejected);

        builder
            .addCase(deleteGroupAsync.pending, handlePending)
            .addCase(deleteGroupAsync.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.groups = state.groups.filter((group) => group.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteGroupAsync.rejected, handleRejected);

        builder
            .addCase(getGroupAsync.pending, handlePending)
            .addCase(getGroupAsync.fulfilled, (state, action: PayloadAction<GroupDetail>) => {
                state.loading = false;
                state.group = action.payload;
                state.error = null;
            })
            .addCase(getGroupAsync.rejected, handleRejected);
        builder.addCase(patchGroupAsync.pending, handlePending)
            .addCase(patchGroupAsync.fulfilled, (state, action: PayloadAction<{ group: Group }>) => {
                state.loading = false;
                state.groups = state.groups.map((group) =>
                    group.id === action.payload.group.id ? action.payload.group : group
                );
                state.error = null;
            })
            .addCase(patchGroupAsync.rejected, handleRejected);
    },
});

export const { clearError } = groupSlice.actions;
export default groupSlice.reducer;