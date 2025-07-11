import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Group, GroupDetail, GroupForm } from '../../types/group';
import { TokenService } from '../../services/token';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});


export const createGroupAsync = createAsyncThunk(
    'groups/createGroupAsync',
    async (groupForm: GroupForm, { rejectWithValue }) => {
        try {
            const response = await api.post('/groups', { 
                name: groupForm.name,
                topic_id: groupForm.topic_id,
                student_ids: groupForm.student_ids
             });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Tạo nhóm thất bại');
        }
    }
);

export const fetchGroupsAsync = createAsyncThunk(
    'groups/fetchGroupsAsync',
    async ({ page = 1, per_page = 10, keyword = '', status = '' }: { page: number; per_page: number; keyword: string; status: string }, { rejectWithValue }) => {
        try {
            const response = await api.get('/groups', { params: { page, per_page, keyword, status } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lấy danh sách nhóm thất bại');
        }
    }
);

export const updateGroupStatusAsync = createAsyncThunk(
    'groups/updateGroupStatusAsync',
    async (groupForm: any, { rejectWithValue }) => {
        try {
            console.log(`groupForm`, groupForm  );
            const response = await api.patch(`/groups/${groupForm.id}`, { group: {
                status: groupForm.status
            } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật nhóm thất bại');
        }
    }
);

export const updateGroupAsync = createAsyncThunk(
    'groups/updateGroupAsync',
    async (groupForm: any, { rejectWithValue }) => {
        try {
            console.log(`groupForm`, groupForm  );
            
            const response = await api.put(`/groups/${groupForm.id}`, { group  : {
                name: groupForm.groupData.name,
                student_ids: groupForm.groupData.student_ids,
                student_lead_id: parseInt(groupForm.groupData.student_lead_id),
                description: groupForm.groupData.description,
            } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật nhóm thất bại');
        }
    }
)
export const deleteGroupAsync = createAsyncThunk(
    'groups/deleteGroupAsync',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/groups/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Xóa nhóm thất bại');
        }
    }
)
export const getGroupAsync = createAsyncThunk(
    'groups/getGroupAsync',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/groups/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lấy nhóm thất bại');
        }
    }
)
export const fetchGroupByMeAsync = createAsyncThunk(
    'groups/fetchGroupByMeAsync',
    async ({ page = 1, per_page = 10 , status = '', keyword  = '' }: { page: number; per_page: number , status : string, keyword : string }, { rejectWithValue }) => {
        try {
            const response = await api.get('users/groups/me', { params: { page, per_page , status, keyword} });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lọc theo giảng viên thất bại');
        }
    }
)

const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        groups: [] as Group[],
        group: {} as GroupDetail,
        loading: false,
        total_pages: 0,
        current_page: 1,
        error: null as string | null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroupsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload.groups || [];
                state.total_pages = action.payload.total_pages;
                state.current_page = action.payload.current_page;
                state.error = null;
            })
            .addCase(fetchGroupsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(fetchGroupByMeAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupByMeAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload.groups || [];
                state.total_pages = action.payload.total_pages;
                state.current_page = action.payload.current_page;
                state.error = null;
            })
            .addCase(fetchGroupByMeAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(getGroupAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getGroupAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.group = action.payload || {};
                state.error = null;
            })
            .addCase(getGroupAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createGroupAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroupAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups.push(action.payload.group);
                state.error = null;
            })
            .addCase(createGroupAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateGroupAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateGroupAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = state.groups.map((group) => group.id === action.payload.group.id ? action.payload.group : group);
                state.error = null;
            })
            .addCase(updateGroupAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteGroupAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteGroupAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.groups  = state.groups.filter((group) => group.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteGroupAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder.addCase(updateGroupStatusAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateGroupStatusAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.groups = state.groups.map((group) => group.id === action.payload.group.id ? action.payload.group : group);
            state.error = null;
        })
        .addCase(updateGroupStatusAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

    },
});

export const { clearError } = groupSlice.actions;
export default groupSlice.reducer;