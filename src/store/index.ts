import { configureStore } from '@reduxjs/toolkit';
import pkReducer from '../features/pkSlice';

export const store = configureStore({
  reducer: {
    pk: pkReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
