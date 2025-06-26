import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import { useDispatch } from 'react-redux';
import planReducer from './planSlice';
import studentReducer from './auth/studentSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        plans : planReducer,
        students : studentReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
    