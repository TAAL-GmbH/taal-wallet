import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { withReduxStateSync } from 'redux-state-sync';
import { woc } from '../libs/WOC';
import { PKType } from '../types';

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
    setState(state, { payload }: PayloadAction<State>) {
      Object.assign(state, payload);
    },
    replacePKList(state, action: PayloadAction<PKType[]>) {
      state.list = action.payload;
    },
    appendPK(state, action: PayloadAction<PKType>) {
      if (
        state.list.find(item => item.privateKey === action.payload.privateKey)
      ) {
        throw new Error('Key already exists');
      }
      state.list.push(action.payload);
    },
    setActivePk(state, action: PayloadAction<PKType | null>) {
      state.current = action.payload;
    },
    setBalance(
      state,
      action: PayloadAction<{ address: string; amount: number }>
    ) {
      console.log('setBalance!!!!!!!!!!!!!!!', action.payload);
      const { address, amount } = action.payload;
      const pk = state.list.find(pk => pk.address === address);
      if (pk) {
        pk.balance = {
          updatedAt: Date.now(),
          amount,
        };
        if (state.current?.address === pk.address) {
          state.current.balance = pk.balance;
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBalance.pending, (state, action) => {
        console.log('fetchBalance.pending', action.meta.arg);
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        console.log(chrome.runtime, { state, action });
        const balance = {
          updatedAt: Date.now(),
          amount: action.payload,
        };
        if (state.current?.address === action.meta.arg) {
          state.current.balance = balance;
        }
        const pkInList = state.list.find(
          item => item.address === action.meta.arg
        );
        if (!pkInList) {
          throw new Error("Can't find PK in list");
        }

        pkInList.balance = balance;
      });
  },
});

export const { setState, replacePKList, appendPK, setActivePk, setBalance } =
  pkSlice.actions;

export default pkSlice.reducer;
