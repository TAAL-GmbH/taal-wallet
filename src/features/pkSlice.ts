import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { networkList } from '../constants/networkList';
import { PKMap, PKType, RootPKType } from '../types';
import { isBackgroundScript } from '../utils/generic';

type State = {
  activePk: PKType | null;
  rootPk: RootPKType | null;
  map: PKMap;
  network: typeof networkList[0] | null;
  isInSync: boolean;
  isLocked: boolean | null;
};

const initialState: State = {
  activePk: null,
  rootPk: null,
  map: {},
  network: null,
  isInSync: isBackgroundScript() ? true : null, // true in background.js, null elsewhere
  isLocked: isBackgroundScript() ? true : null, // true in background.js, null elsewhere
};

const setStateBalance = (state: State, address: string, amount: number) => {
  const pk = state.map[address];

  if (pk) {
    pk.balance = {
      updatedAt: Date.now(),
      amount,
    };
    if (state.activePk?.address === address) {
      state.activePk.balance = state.map[address].balance;
    }
  }
};

const pkSlice = createSlice({
  name: 'pk',
  initialState,
  reducers: {
    setState(state, { payload }: PayloadAction<Partial<State>>) {
      Object.assign(state, payload);
    },
    replacePKMap(state, action: PayloadAction<PKMap>) {
      state.map = action.payload;
    },
    appendPK(state, action: PayloadAction<PKType>) {
      if (state.map[action.payload.address]) {
        throw new Error('Key already exists');
      }
      state.map[action.payload.address] = action.payload;
    },
    appendPKList(state, action: PayloadAction<PKType[]>) {
      action.payload.forEach(pk => {
        if (state.map[pk.address]) {
          console.warn('Key already exists', pk);
        }
        state.map[pk.address] = pk;
      });
    },
    deletePK(state, action: PayloadAction<string>) {
      if (state.map[action.payload]) {
        throw new Error('Key does not exists');
      }
      delete state.map[action.payload];
      if (state.activePk?.address === action.payload) {
        state.activePk = null;
      }
    },
    lockWallet(state) {
      state.isLocked = true;
      state.rootPk = null;
    },
    setRootPK(state, action: PayloadAction<RootPKType>) {
      state.rootPk = action.payload;
      state.isLocked = false;
    },
    setNetwork(state, action: PayloadAction<typeof networkList[0]>) {
      state.network = action.payload;
    },
    setActivePk(state, action: PayloadAction<string | null>) {
      state.activePk = state.map[action.payload];
    },
    setBalance(state, action: PayloadAction<{ address: string; amount: number }>) {
      setStateBalance(state, action.payload.address, action.payload.amount);
    },
    setBatchBalance(state, action: PayloadAction<{ address: string; amount: number }[]>) {
      action.payload.forEach(({ address, amount }) => {
        setStateBalance(state, address, amount);
      });
    },
  },
});

export const {
  setState,
  replacePKMap,
  appendPK,
  appendPKList,
  deletePK,
  lockWallet,
  setRootPK,
  setNetwork,
  setActivePk,
  setBalance,
  setBatchBalance,
} = pkSlice.actions;

export default pkSlice.reducer;
