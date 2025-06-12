import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import { useDispatch } from 'react-redux';
import planReducer from './planSlice';
const store = configureStore({
    reducer: {
        auth: authReducer,
        plans : planReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
