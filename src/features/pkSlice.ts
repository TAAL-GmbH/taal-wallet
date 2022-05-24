import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PK_CURRENT_KEY } from '../constants';
import { woc } from '../libs/WOC';
import { PKType } from '../types';
import { isNull } from '../utils/generic';

type State = {
  current: PKType | null;
  list: PKType[];
};

const initialState: State = {
  current: null,
  list: [],
};

export const fetchBalance = createAsyncThunk(
  'woc/fetchBalance',
  woc.getBalance
);

const pkSlice = createSlice({
  name: 'pk',
  initialState,
  reducers: {
    replacePKList(state, action: PayloadAction<PKType[]>) {
      state.list = action.payload;
    },
    appendPK(state, action: PayloadAction<PKType>) {
      state.list.push(action.payload);
    },
    setActivePk(state, action: PayloadAction<PKType | null>) {
      state.current = action.payload;
      chrome.storage.local.set({ [PK_CURRENT_KEY]: action.payload });
    },
    setBalance(
      state,
      action: PayloadAction<{ address: string; balance: number }>
    ) {
      const { address, balance } = action.payload;
      const pk = state.list.find(pk => pk.address === address);
      if (pk) {
        pk.balance = balance;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBalance.pending, (state, action) => {
        console.log('fetchBalance.pending', action.meta.arg);
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        if (state.current?.address === action.meta.arg) {
          state.current.balance = action.payload;
        }
        const pkInList = state.list.find(
          item => item.address === action.meta.arg
        );
        if (!pkInList) {
          throw new Error("Can't find PK in list");
        }

        pkInList.balance = action.payload;
      });
  },
});

export const { replacePKList, appendPK, setActivePk, setBalance } =
  pkSlice.actions;
export default pkSlice.reducer;
