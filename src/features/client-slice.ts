import { isBackgroundScript } from '@/utils/generic';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Client = {
  origin: string;
};

export type ClientState = {
  connectedList: Client[];
};

const initialState: ClientState = {
  connectedList: [],
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setState(state, { payload }: PayloadAction<ClientState>) {
      Object.assign(state, payload);
    },
    addClient(state, { payload }: PayloadAction<Client>) {
      if (!state.connectedList.find(c => c.origin === payload.origin)) {
        state.connectedList.push(payload);
      }
    },
    removeClient(state, { payload }: PayloadAction<Client>) {
      if (!isBackgroundScript()) {
        console.log('removeClient', payload);
      }
      state.connectedList = state.connectedList.filter(c => c.origin !== payload.origin);
      if (!isBackgroundScript()) {
        console.log('new state.connectedList', state.connectedList);
      }
    },
  },
});

export const { setState, addClient, removeClient } = clientSlice.actions;

export const pkActions = clientSlice.actions;

export default clientSlice.reducer;
