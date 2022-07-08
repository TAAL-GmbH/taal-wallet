import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountType } from '../types';

type State = {
  accountList: AccountType[];
  accountMap: Record<string, AccountType>;
  activeAccountId: string | null;
};

const initialState: State = {
  accountList: [],
  accountMap: {},
  activeAccountId: null,
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
  },
});

export const { setAccountList, addAccount, setActiveAccountId, updateAccountName } = accountSlice.actions;

export default accountSlice.reducer;
