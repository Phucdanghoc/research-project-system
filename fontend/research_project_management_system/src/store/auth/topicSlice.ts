import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Topic, TopicGeneral } from '../../types/topic';
import { TokenService } from '../../services/token';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

api.defaults.headers.common['Authorization'] = 'Bearer ' + TokenService.getToken();

export const fetchTopicsAsync = createAsyncThunk(
  'topics/fetchTopicsAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/topics');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lấy danh sách đề tài thất bại';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addTopicAsync = createAsyncThunk(
  'topics/addTopicAsync',
  async (topic: Omit<Topic, 'id' | 'createdAt' | 'updateAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/topics', {topic : topic});
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
)

export const updateTopicAsync = createAsyncThunk(
  'topics/updateTopicAsync',
  async (topic: Topic, { rejectWithValue }) => {
    try {
      const response = await api.put(`/topics/${topic.id}`, {topic : topic});
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Cập nhật đề tài thất bại';
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
  loading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  loading: false,
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
    builder
      .addCase(fetchTopicsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics || [];
        state.error = null;
      })
      .addCase(fetchTopicsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addTopicAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload.data);
        state.error = null;
      })
      .addCase(addTopicAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateTopicAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTopic = action.payload.topic;
        state.topics = state.topics.map((topic) =>
          topic.id === updatedTopic.id ? updatedTopic : topic
        );
        state.error = null;
      })
      .addCase(updateTopicAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(deleteTopicAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter((topic) => topic.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTopicAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(generateTopicAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTopicAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(...action.payload.topic);
        state.error = null;
      })
      .addCase(generateTopicAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = topicSlice.actions;
export default topicSlice.reducer;