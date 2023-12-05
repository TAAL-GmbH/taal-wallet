import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ROOT_PK_HASH_KEY } from '@/constants';
import { networkList } from '@/constants/network-list';
import { PKMap, PKType, RootPKType } from '@/types';
import { isBackgroundScript } from '@/utils/generic';
import { sessionStorage } from '@/utils/chrome-storage';

const IsNotifiedKeys = <const>['toBackupPassphrase'];

type State = {
  activePk: PKType | null;
  rootPk: RootPKType | null;
  map: PKMap;
  network: typeof networkList[0] | null;
  isInSync: boolean;
  isLocked: boolean | null;
  isSendBsvLocked: boolean;
  isStateInitialized: boolean;
  isNotified: Record<typeof IsNotifiedKeys[number], boolean | null>;
};

const initialState: State = {
  activePk: null,
  rootPk: null,
  map: {},
  network: null,
  isInSync: isBackgroundScript() ? true : null, // true in background.js, null elsewhere
  isLocked: null, // setting to null as it must be initialized in storeSync
  isSendBsvLocked: false,
  isStateInitialized: false,
  isNotified: {
    toBackupPassphrase: null,
  },
};

const setStateBalance = (state: State, address: string, satoshis: number) => {
  const pk = state.map[address];

  if (pk) {
    pk.balance = {
      updatedAt: Date.now(),
      satoshis,
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
    clearState(state) {
      Object.assign(state, {
        map: {},
        rootPk: null,
        activePk: null,
        network: null,
        isLocked: true,
      });
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
      sessionStorage.remove(ROOT_PK_HASH_KEY);
    },
    setRootPK(state, action: PayloadAction<RootPKType>) {
      state.rootPk = action.payload;
      state.isLocked = false;
      sessionStorage.set({ [ROOT_PK_HASH_KEY]: action.payload.privateKeyHash });
    },
    setNetwork(state, action: PayloadAction<typeof networkList[0]>) {
      state.network = action.payload;
    },
    setActivePk(state, action: PayloadAction<string | null>) {
      if (state.map[action.payload]) {
        state.activePk = state.map[action.payload];
      } else {
        console.error(`PK ${action.payload} does not exists`, { state, payload: action.payload });
        throw new Error(`PK ${action.payload} does not exists`);
      }
    },
    updateWalletName(state, { payload }: PayloadAction<{ address: string; walletName: string }>) {
      state.map[payload.address].name = payload.walletName;
      if (state.activePk?.address === payload.address) {
        state.activePk.name = payload.walletName;
      }
    },
    setBalance(state, action: PayloadAction<{ address: string; satoshis: number }>) {
      setStateBalance(state, action.payload.address, action.payload.satoshis);
    },
    setBatchBalance(state, action: PayloadAction<{ address: string; satoshis: number }[]>) {
      action.payload.forEach(({ address, satoshis }) => {
        setStateBalance(state, address, satoshis);
      });
    },
    setIsSendBsvLocked(state, action: PayloadAction<boolean>) {
      state.isSendBsvLocked = action.payload;
    },
    setIsNotified(state, action: PayloadAction<typeof state.isNotified>) {
      state.isNotified = {
        ...state.isNotified,
        ...action.payload,
      };
    },
  },
});

export const {
  setState,
  clearState,
  replacePKMap,
  appendPK,
  appendPKList,
  deletePK,
  lockWallet,
  setRootPK,
  setNetwork,
  setActivePk,
  updateWalletName,
  setBalance,
  setBatchBalance,
  setIsSendBsvLocked,
  setIsNotified,
} = pkSlice.actions;

export const pkActions = pkSlice.actions;

export default pkSlice.reducer;
