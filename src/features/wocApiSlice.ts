import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setBalance } from '../features/pkSlice';

type Balance = {
  amount: number;
};
type BalanceResponse = {
  confirmed: number;
  unconfirmed: number;
};

export const wocApiSlice = createApi({
  reducerPath: 'wocApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://taalnet.whatsonchain.com/v1/bsv/taalnet',
  }),
  endpoints: builder => ({
    getBalanceByAddress: builder.query<Balance, string>({
      query: address => `/address/${address}/balance`,
      transformResponse: (response: BalanceResponse, meta, arg): Balance => {
        return {
          amount: response.confirmed + response.unconfirmed,
        };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted getBalanceByAddress', {
          id,
          queryFulfilled,
        });
      },
      async onCacheEntryAdded(
        id,
        { cacheDataLoaded, getCacheEntry, dispatch }
      ) {
        await cacheDataLoaded;
        const { data, originalArgs: address = 'no-address' } = getCacheEntry();
        console.log('getCacheEntry', {
          [address]: data,
          setBalance: setBalance({ address, amount: 1222142 }),
        });
        dispatch({
          type: 'pk/setBalance',
          payload: {
            address,
            amount: data?.amount,
          },
        });
      },
    }),
  }),
});

export const { useGetBalanceByAddressQuery } = wocApiSlice;
