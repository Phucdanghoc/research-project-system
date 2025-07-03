import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './auth/authSlice';
import studentReducer from './auth/studentSlice';
import topicReducer from './auth/topicSlice';
import lectureReducer from './auth/lecturerSlice';
import groupReducer from './auth/groupSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        topics : topicReducer,
        students : studentReducer,
        lecturers : lectureReducer,
        groups : groupReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
    