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
      const errorMessage = error.response?.data?.message || 'Lấy danh sách đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getTopicByMeAsync = createAsyncThunk(
  'topics/getTopicByMeAsync',
  async (
    { keyword, status, page = 1, per_page = 10 }: { keyword: string; status: string; page: number; per_page: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/topics/me', { params: { page, per_page, keyword, status } });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lấy danh sách đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);
export const getTopicsInFacultyAsync = createAsyncThunk(
  'topics/getTopicInMyFacultyAsync',
  async (
    { keyword, status, page = 1, per_page = 10 }: { keyword: string; status: string; page: number; per_page: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/topics/faculty_me', { params: { page, per_page, keyword, status } });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lấy danh sách đề tài trong khoa thất bại';
      return rejectWithValue(errorMessage);
    }
  }
)

export const searchTopicAsync = createAsyncThunk(
  'topics/searchTopicAsync',
  async ({ keyword, page = 1, per_page = 10 }: { keyword: string; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/search', { params: { keyword, page, per_page } });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Tìm kiếm đề tài thất bại';
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Lọc theo danh mục thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const filterByStatusAsync = createAsyncThunk(
  'topics/filterByStatusAsync',
  async ({ status, page = 1, per_page = 10 }: { status: string; page: number; per_page: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics/filter_by_status', { params: { status, page, per_page } });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lọc theo trạng thái thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addTopicAsync = createAsyncThunk(
  'topics/addTopicAsync',
  async (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/topics', topic);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Thêm đề tài thất bại';
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Tạo đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTopicAsync = createAsyncThunk(
  'topics/updateTopicAsync',
  async (topic: Topic, { rejectWithValue }) => {
    try {
      const response = await api.put(`/topics/${topic.id}`, topic);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Cập nhật đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getTopicByIdAsync = createAsyncThunk(
  'topics/getTopicByIdAsync',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/topics/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lấy thông tin đề tài thất bại';
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Xóa đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

interface TopicState {
  topics: Topic[];
  topic: Topic | null;
  loading: boolean;
  total_pages: number;
  current_page: number;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  topic: null,
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
    // Common handlers
    const handlePending = (state: TopicState) => {
      state.loading = true;
      state.error = null;
    };

    const handleFetchFulfilled = (state: TopicState, action: any) => {
      state.loading = false;
      console.log(`Fetched topics:`, action.payload.data?.topics);

      state.topics = action.payload?.topics || [];
      state.total_pages = action.payload?.total_pages || 1;
      state.current_page = action.payload?.current_page || 1;
      state.error = null;
    };

    const handleRejected = (state: TopicState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    // Fetch topics
    builder
      .addCase(fetchTopicsAsync.pending, handlePending)
      .addCase(fetchTopicsAsync.fulfilled, handleFetchFulfilled)
      .addCase(fetchTopicsAsync.rejected, handleRejected)
      // Get topics by me
      .addCase(getTopicByMeAsync.pending, handlePending)
      .addCase(getTopicByMeAsync.fulfilled, handleFetchFulfilled)
      .addCase(getTopicByMeAsync.rejected, handleRejected)
      // Get topics in my faculty
      .addCase(getTopicsInFacultyAsync.pending, handlePending)
      .addCase(getTopicsInFacultyAsync.fulfilled, handleFetchFulfilled)
      .addCase(getTopicsInFacultyAsync.rejected, handleRejected)
      // Search topics
      .addCase(searchTopicAsync.pending, handlePending)
      .addCase(searchTopicAsync.fulfilled, handleFetchFulfilled)
      .addCase(searchTopicAsync.rejected, handleRejected)
      // Filter by category
      .addCase(filterByCategoryAsync.pending, handlePending)
      .addCase(filterByCategoryAsync.fulfilled, handleFetchFulfilled)
      .addCase(filterByCategoryAsync.rejected, handleRejected)
      // Filter by status
      .addCase(filterByStatusAsync.pending, handlePending)
      .addCase(filterByStatusAsync.fulfilled, handleFetchFulfilled)
      .addCase(filterByStatusAsync.rejected, handleRejected)
      // Add topic
      .addCase(addTopicAsync.pending, handlePending)
      .addCase(addTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload.data);
        state.error = null;
      })
      .addCase(addTopicAsync.rejected, handleRejected)
      // Generate topic
      .addCase(generateTopicAsync.pending, handlePending)
      .addCase(generateTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(...(action.payload.data?.topics || []));
        state.error = null;
      })
      .addCase(generateTopicAsync.rejected, handleRejected)
      // Update topic
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
      // Get topic by ID
      .addCase(getTopicByIdAsync.pending, handlePending)
      .addCase(getTopicByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topic = action.payload;
        state.error = null;
      })
      .addCase(getTopicByIdAsync.rejected, handleRejected)
      // Delete topic
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