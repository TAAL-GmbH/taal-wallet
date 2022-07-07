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
  },
});

export const { setAccountList, addAccount, setActiveAccountId } = accountSlice.actions;

export default accountSlice.reducer;
