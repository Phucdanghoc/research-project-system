import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Topic, TopicGeneral } from '../../types/topic';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { Authorization: `Bearer ${TokenService.getToken()}` },
});

export const fetchTopicsAsync = createAsyncThunk(
  'topics/fetchTopicsAsync',
  async ({ page = 1, per_page = 10 }: { page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics', { params: { page, per_page } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách đề tài thất bại');
    }
  }
);

export const searchTopicAsync = createAsyncThunk(
  'topics/searchTopicAsync',
  async ({ keyword, page = 1, per_page = 10 }: { keyword: string; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/search', { params: { keyword, page, per_page } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tìm kiếm đề tài thất bại');
    }
  }
);

export const filterByCategoryAsync = createAsyncThunk(
  'topics/filterByCategoryAsync',
  async ({ category, page = 1, per_page = 10 }: { category: string; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/filter_by_category', { params: { category, page, per_page } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lọc theo danh mục thất bại');
    }
  }
);

const getTopicByLecturerAsync = createAsyncThunk(
  'topics/getTopicByLecturerAsync',
  async ({ lecturer, page = 1, per_page = 10 }: { lecturer: number; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/lecturer/:id', { params: { lecturer, page, per_page } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lọc theo giảng viên thất bại');
    }
  }
)

export const filterByStatusAsync = createAsyncThunk(
  'topics/filterByStatusAsync',
  async ({ status, page = 1, per_page = 10 }: { status: string; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/filter_by_status', { params: { status, page, per_page } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lọc theo trạng thái thất bại');
    }
  }
);

export const addTopicAsync = createAsyncThunk(
  'topics/addTopicAsync',
  async (topic: Omit<Topic, 'id' | 'createdAt' | 'updateAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/topics', { topic });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Thêm đề tài thất bại');
    }
  }
);

export const generateTopicAsync = createAsyncThunk(
  'topics/generateTopicAsync',
  async (topic: TopicGeneral, { rejectWithValue }) => {
    try {
      const response = await api.post('/topics/generate', topic);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo đề tài thất bại');
    }
  }
);

export const updateTopicAsync = createAsyncThunk(
  'topics/updateTopicAsync',
  async (topic: Topic, { rejectWithValue }) => {
    try {
      const response = await api.put(`/topics/${topic.id}`, { topic });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật đề tài thất bại');
    }
  }
);

export const deleteTopicAsync = createAsyncThunk(
  'topics/deleteTopicAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/topics/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa đề tài thất bại');
    }
  }
);

interface TopicState {
  topics: Topic[];
  loading: boolean;
  total_pages: number;
  current_page: number;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  loading: false,
  total_pages: 1,
  current_page: 1,
  error: null,
};

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: TopicState) => {
      state.loading = true;
      state.error = null;
    };

    const handleFulfilledFetch = (state: TopicState, action: any) => {
      state.loading = false;
      state.topics = action.payload.topics || [];
      state.total_pages = action.payload.total_pages;
      state.current_page = action.payload.current_page;
      state.error = null;
    };

    const handleRejected = (state: TopicState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(fetchTopicsAsync.pending, handlePending)
      .addCase(fetchTopicsAsync.fulfilled, handleFulfilledFetch)
      .addCase(fetchTopicsAsync.rejected, handleRejected)
      .addCase(searchTopicAsync.pending, handlePending)
      .addCase(searchTopicAsync.fulfilled, handleFulfilledFetch)
      .addCase(searchTopicAsync.rejected, handleRejected)
      .addCase(filterByCategoryAsync.pending, handlePending)
      .addCase(filterByCategoryAsync.fulfilled, handleFulfilledFetch)
      .addCase(filterByCategoryAsync.rejected, handleRejected)
      .addCase(filterByStatusAsync.pending, handlePending)
      .addCase(filterByStatusAsync.fulfilled, handleFulfilledFetch)
      .addCase(filterByStatusAsync.rejected, handleRejected)
      .addCase(addTopicAsync.pending, handlePending)
      .addCase(getTopicByLecturerAsync.fulfilled, handleFulfilledFetch)
      .addCase(getTopicByLecturerAsync.rejected, handleRejected)
      .addCase(getTopicByLecturerAsync.pending, handlePending)
      .addCase(addTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload.data);
        state.error = null;
      })
      .addCase(addTopicAsync.rejected, handleRejected)
      .addCase(generateTopicAsync.pending, handlePending)
      .addCase(generateTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(...action.payload.topics);
        state.error = null;
      })
      .addCase(generateTopicAsync.rejected, handleRejected)
      .addCase(updateTopicAsync.pending, handlePending)
      .addCase(updateTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTopic = action.payload.topic;
        state.topics = state.topics.map((topic) =>
          topic.id === updatedTopic.id ? updatedTopic : topic
        );
        state.error = null;
      })
      .addCase(updateTopicAsync.rejected, handleRejected)
      .addCase(deleteTopicAsync.pending, handlePending)
      .addCase(deleteTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter((topic) => topic.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTopicAsync.rejected, handleRejected);
  },
});

export const { clearError } = topicSlice.actions;
export default topicSlice.reducer;