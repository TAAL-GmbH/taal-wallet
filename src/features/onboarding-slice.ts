import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { networkList } from '@/constants/network-list';

export type OnboardingState = {
  networkId: typeof networkList[number] | null;
  accountName: string;
  password: string;
  password2: string;
  isTosAgreed: boolean;
};

const initialState: OnboardingState = {
  networkId: null,
  accountName: '',
  password: '',
  password2: '',
  isTosAgreed: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setState(state, { payload }: PayloadAction<Partial<OnboardingState>>) {
      Object.assign(state, payload);
    },
    clearState() {
      return initialState;
    },
  },
});

export const { setState, clearState } = onboardingSlice.actions;

export const pkActions = onboardingSlice.actions;

export default onboardingSlice.reducer;
