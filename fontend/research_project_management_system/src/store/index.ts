import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import { useDispatch } from 'react-redux';
import studentReducer from './auth/studentSlice';
import topicReducer from './auth/topicSlice';
import lectureReducer from './auth/lecturerSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        topics : topicReducer,
        students : studentReducer,
        lecturers : lectureReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
    