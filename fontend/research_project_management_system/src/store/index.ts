import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import topicReducer from './slices/topicSlice';
import lectureReducer from './slices/lecturerSlice';
import groupReducer from './slices/groupSlice';
import userReducer from './slices/userSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        topics : topicReducer,
        students : studentReducer,
        lecturers : lectureReducer,
        groups : groupReducer,
        users : userReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
    