import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountType } from '../types';

type AccountEvent = {
  type?: 'error' | 'success' | 'info' | 'warning';
  message: string;
  showToUser?: boolean;
  timestamp: number;
};

type State = {
  accountList: AccountType[];
  accountMap: Record<string, AccountType>;
  activeAccountId: string | null;
  eventList: AccountEvent[];
  creation: {
    isCreating: boolean;
    isHistoryFetching: boolean;
    restoredWalletsCount: number;
    derivationPathLastIndex: number;
  };
};

const creationInitialState: State['creation'] = {
  isCreating: false,
  isHistoryFetching: false,
  restoredWalletsCount: 0,
  derivationPathLastIndex: 0,
};

const initialState: State = {
  accountList: [],
  accountMap: {},
  activeAccountId: null,
  eventList: [],
  creation: creationInitialState,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setState(state, { payload }: PayloadAction<Partial<State>>) {
      Object.assign(state, payload);
    },
    setAccountList(state, { payload }: PayloadAction<AccountType[]>) {
      if (payload?.length) {
        state.accountList = payload;
        state.accountMap = payload.reduce((acc, account) => {
          acc[account.id] = account;
          return acc;
        }, {} as Record<string, AccountType>);
      }
    },
    addAccount(state, { payload }: PayloadAction<AccountType>) {
      state.accountList.push(payload);
      state.accountMap[payload.id] = payload;
    },
    setActiveAccountId(state, { payload }: PayloadAction<string | null>) {
      state.activeAccountId = payload;
    },
    updateAccountName(state, { payload }: PayloadAction<{ accountId: string; accountName: string }>) {
      const accountInMap = state.accountMap[payload.accountId];
      if (accountInMap) {
        accountInMap.name = payload.accountName;
      }
      state.accountList = Object.values(state.accountMap);
    },
    accountEvent(state, { payload }: PayloadAction<Omit<AccountEvent, 'timestamp'>>) {
      state.eventList = [
        ...state.eventList,
        {
          type: 'info' as AccountEvent['type'],
          ...payload,
          timestamp: Date.now(),
        },
      ].slice(-200);
    },
    setIsCreating(state, { payload }: PayloadAction<boolean>) {
      if (payload) {
        state.eventList = [];
        state.creation = {
          ...creationInitialState,
          isCreating: true,
        };
      } else {
        state.creation.isCreating = false;
      }
    },
    setIsHistoryFetching(state, { payload }: PayloadAction<boolean>) {
      state.creation.isHistoryFetching = payload;
    },
    setRestoredWalletsCount(state, { payload }: PayloadAction<number>) {
      state.creation.restoredWalletsCount = payload;
    },
    setAccountCreationDerivationPathLastIndex(state, { payload }: PayloadAction<number>) {
      state.creation.derivationPathLastIndex = payload;
    },
  },
});

export const {
  setAccountList,
  addAccount,
  setActiveAccountId,
  updateAccountName,
  accountEvent,
  setIsCreating,
  setIsHistoryFetching,
  setRestoredWalletsCount,
  setAccountCreationDerivationPathLastIndex,
} = accountSlice.actions;

export default accountSlice.reducer;
