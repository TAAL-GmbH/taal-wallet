import { configureStore } from '@reduxjs/toolkit';
// @ ts-ignore
// import logger from 'redux-logger';
import pkReducer from '@/features/pk-slice';
import accountReducer from '@/features/account-slice';
import onboardingReducer from '@/features/onboarding-slice';
import clientReducer from '@/features/client-slice';
import { wocApiSlice } from '@/features/woc-api-slice';
import { reduxSyncMiddleWare } from '@/utils/redux-sync-middleware';

export const store = configureStore({
  reducer: {
    pk: pkReducer,
    account: accountReducer,
    onboarding: onboardingReducer,
    client: clientReducer,
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
