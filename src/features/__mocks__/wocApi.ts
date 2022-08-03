import { store } from '@/src/store';
import { setBatchBalance } from '../pkSlice';

export const getUnspent = () => ({
  data: [
    {
      height: 1503581,
      tx_pos: 1,
      tx_hash: '06adc6b32358e657575993fd8826275d283c356144353547e2be2871e55d4ea4',
      value: 995959,
    },
    {
      height: 0,
      tx_pos: 1,
      tx_hash: '436c615eaeb30607a9a0fd4faa85e12a47111eef50e82a1b4eed7798339f64fa',
      value: 1000000,
    },
    {
      height: 0,
      tx_pos: 0,
      tx_hash: '4af1d9d3e90c91ebe294fdf6ca7885be3e5ab5d6efb83df6f799544f557dd35d',
      value: 1000000,
    },
  ],
});

export const getTx = () => ({
  data: {
    txid: 'c85dc8bae4fbeb806f72bf62e8f29676307edbd42974a90c53da129810826af0',
    hash: 'c85dc8bae4fbeb806f72bf62e8f29676307edbd42974a90c53da129810826af0',
    version: 2,
    size: 225,
    locktime: 1503579,
    vin: [
      {
        coinbase: '',
        txid: '1e8a18546fc5400a68f710b17ecfe99d87eab61a821dc5de9047fe4dd8fd4ed1',
        vout: 1,
        scriptSig: {
          asm: '304402207a7eb69dd854abd30d9c297e9990808738c218ca3dde9563eb8af6f6c92852af02202744484cf21ce89cca9ba5e02f8dad510bb81a8e02091c3a8a88fb97fe33e923[ALL|FORKID] 029aef2f65dd1b10dcb0e31f84e8a2efe1570e731b865f01779560bb1008bed06a',
          hex: '47304402207a7eb69dd854abd30d9c297e9990808738c218ca3dde9563eb8af6f6c92852af02202744484cf21ce89cca9ba5e02f8dad510bb81a8e02091c3a8a88fb97fe33e9234121029aef2f65dd1b10dcb0e31f84e8a2efe1570e731b865f01779560bb1008bed06a',
        },
        sequence: 4294967294,
      },
    ],
    vout: [
      {
        value: 9.3671524,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 756649a9e747302b9a28a53b235809be96abb9c0 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914756649a9e747302b9a28a53b235809be96abb9c088ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['mrDhtaLSML7Kcj6PD6wLqfqyYVs9csnpPd'],
          isTruncated: false,
        },
      },
      {
        value: 0.01,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 11392aa71fb203ee7145e1cf46771a08c8d923f6 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91411392aa71fb203ee7145e1cf46771a08c8d923f688ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['mh62GKa9jwsYztZRGAUbFA9iVF5oM3HoVf'],
          isTruncated: false,
        },
      },
    ],
  },
});

export const broadcast = jest.fn(() => {
  return {
    data: 'cd73522be888ca665ccc5218fd79f5c8217acd4ede208f6b3c77700baa0964c2',
  };
});

let getHistoryCounter = 0;

export const getHistory = jest.fn(() => {
  getHistoryCounter++;
  return {
    status: 'fulfilled',
    data:
      // if 5th request returns some history, i means we gonna need to do 20 more requests
      getHistoryCounter === 5
        ? [
            { tx_hash: '643f4e85e7c280da2a1c81ba9167e3511a6973f110751bcd03127762048bdb46', height: 86739 },
            { tx_hash: '1133ac9abf5d210809c2e567bc7411d0356ce19e1483dda0e1ee9b83e3aa952d', height: 86740 },
          ]
        : [],
  };
});

export const getBalance = jest.fn(async (address: string) => {
  const responseMap = {
    '0x0000000000000000000000000000000000000000': { confirmed: 2000000, unconfirmed: -1347 },
  };
  const resp = {
    data: [
      {
        address,
        balance: responseMap[address] || { confirmed: 0, unconfirmed: 0 },
        error: '',
      },
    ],
  };
  const total = resp.data.reduce((acc, { balance }) => acc + balance.confirmed + balance.unconfirmed, 0);
  const preparedData = resp.data.map(({ address, balance: { confirmed, unconfirmed } }) => ({
    address,
    amount: confirmed + unconfirmed,
  }));
  store.dispatch(setBatchBalance(preparedData));
  return {
    data: resp.data,
    total,
  };
});
