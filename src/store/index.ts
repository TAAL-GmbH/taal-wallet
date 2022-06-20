import { configureStore } from '@reduxjs/toolkit';
// @ ts-ignore
// import logger from 'redux-logger';
import pkReducer from '../features/pkSlice';
import { wocApiSlice } from '../features/wocApiSlice';
import { reduxSyncMiddleWare } from '../utils/reduxSyncMiddleware';

export const store = configureStore({
  reducer: {
    pk: pkReducer,
    [wocApiSlice.reducerPath]: wocApiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(reduxSyncMiddleWare)
      // .concat(logger)
      .concat(wocApiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
