jest.mock('../features/wocApi');
jest.mock('../db/index.ts');
jest.mock('../db/shared.ts');

import { createHDPrivateKey, rebuildMnemonic } from './../utils/blockchain';
import { AccountFactory } from '../utils/accountFactory';
import { initStoreSync } from '../utils/storeSync';
import * as wocApi from '../features/wocApi';
import { store } from '../store';

const accountName = 'AccountName';
let networkId = 'testnet';
const password = 'password';
let password_invalid: string;
let mnemonicPhrase: string;
const mnemonicPhrase2 = 'ensure ribbon tell sock short citizen staff owner scissors chair rib similar';
// const action = 'importExisting'; // 'createNew';
const action = 'createNew';
let af: AccountFactory;

describe('accountFactory', () => {
  let dateNowSpy: jest.SpyInstance<number>;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1234567890000);
    initStoreSync();
  });

  beforeEach(() => {
    af = new AccountFactory();
    mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk boring';
    networkId = 'testnet';
    // this disables all delays in AccountFactory
    af.setTimeoutMultiplier(0);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      const result = await af.createAccount({
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        action,
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          data: { accountId: '1234567890000', accountName: 'AccountName', networkId: 'testnet' },
        })
      );

      const state1 = store.getState();
      expect(state1.account.activeAccountId).toEqual('1234567890000');
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.name).toEqual('Wallet-0');
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.path).toEqual("m/44'/236'/0'/0/0");
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.satoshis).toBeNull;
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.updatedAt).toBeNull;
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.address).toEqual(
        'mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx'
      );
      expect(state1.pk.rootPk.privateKeyHash).toBeDefined;
      expect(state1.pk.rootPk.privateKeyEncrypted).toBeDefined;
    });

    it('should import an existing account', async () => {
      const result = await af.createAccount({
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        action: 'importExisting',
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          data: { accountId: '1234567890000', accountName: 'AccountName', networkId: 'testnet' },
        })
      );
      // 5th request should return history records. this means we gonna need to do 20 more requests so 25 total
      expect(wocApi.getHistory).toHaveBeenCalledTimes(25);
      const state = store.getState();
      // activeAccountId is created from Date.now() but we're mocking current timestamp to be 1234567890000
      expect(state.account.activeAccountId).toEqual('1234567890000');
      // 5th wallet has history so restored wallet should be Wallet-4 with path m/44'/236'/0'/0/4
      expect(state.pk.map.mmvbyKDxzHhEL8wQwvQviCmWJ7ZhP8hoS8.name).toEqual('Wallet-4');
      expect(state.pk.map.mmvbyKDxzHhEL8wQwvQviCmWJ7ZhP8hoS8.path).toEqual("m/44'/236'/0'/0/4");
      // activePk should be the same as the restored wallet
      expect(state.pk.activePk).toEqual(state.pk.map.mmvbyKDxzHhEL8wQwvQviCmWJ7ZhP8hoS8);
    }, 60000);

    // check with arnas
    it('should import an existing account with a bsv balance', async () => {
      mnemonicPhrase = 'ensure ribbon tell sock short citizen staff owner scissors chair rib similar';
      const result = await af.createAccount({
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        action,
      });

      console.log(result);
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          data: { accountId: '1234567890000', accountName: 'AccountName', networkId: 'testnet' },
        })
      );
      const state1 = store.getState();
      console.log(state1.pk.map);
      expect(state1.pk.map.mj5mLFDAqPdqTmcTSMHL4oG9ZxhQL1GPg7.balance.satoshis).toEqual(1000000);
    }, 60000);

    test.each([(networkId = 'mainnet'), (networkId = 'testnet')])(
      `should attempt to import a wallet with invalid seed phrase on different networks`,
      async () => {
        mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk test';
        const result = await af.createAccount({
          accountName,
          networkId,
          password,
          mnemonicPhrase,
          action,
        });
        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: { message: `Mnemonic string is invalid: ${mnemonicPhrase}` },
          })
        );
        const state1 = store.getState();
        expect(state1.pk.activePk).toBe(null);
      }
    );

    // why is this failing? Where is password validation?
    test.each([(password_invalid = 'p'), (password_invalid = '')]);
    it('should attempt to create an account with invalid password', async () => {
      const result = await af.createAccount({
        accountName,
        networkId,
        password: password_invalid,
        mnemonicPhrase,
        action,
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: { message: `Password must be at least 8 characters in length` },
        })
      );
    });

    it('should attempt to create account with blank account name', async () => {
      let accountName = '';
      const result = await af.createAccount({
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        action,
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: { message: `Account Name cannot be blank` },
        })
      );
    });
  });

  it('should create a new wallet', async () => {
    const { pkInstance: rootKey } = createHDPrivateKey({
      networkId,
      password,
      mnemonic: rebuildMnemonic(mnemonicPhrase.trim()),
    });
    const wallet = af.createWallet(rootKey);
    expect(wallet.address).toEqual('mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx');
    expect(wallet.name).toEqual('Wallet-0');
    expect(wallet.path).toEqual("m/44'/236'/0'/0/0");
    expect(wallet.balance.satoshis).toEqual(null);
    expect(wallet.balance.updatedAt).toEqual(null);
  });

  it('should create multiple wallets to same account', async () => {
    const { pkInstance: rootKey } = createHDPrivateKey({
      networkId,
      password,
      mnemonic: rebuildMnemonic(mnemonicPhrase.trim()),
    });
    const wallet = af.createWallet(rootKey);
    expect(wallet.address).toEqual('mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx');
    const { pkInstance: rootKey2 } = createHDPrivateKey({
      networkId,
      password,
      mnemonic: rebuildMnemonic(mnemonicPhrase2.trim()),
    });

    const wallet2 = af.createWallet(rootKey2);
    expect(wallet2.address).toEqual('mj5mLFDAqPdqTmcTSMHL4oG9ZxhQL1GPg7');
  });

  // check with Arnas
  it.only('should change wallet name', async () => {
    const walletName = "bob's wallet";
    // createAccount(af)
    const { pkInstance: rootKey } = createHDPrivateKey({
      networkId,
      password,
      mnemonic: rebuildMnemonic(mnemonicPhrase.trim()),
    });
    const wallet = af.createWallet(rootKey);
    wallet.name = walletName;
    expect(wallet.name).toEqual(walletName);
  });
});

async function createAccount(af: any) {
  const result = await af.createAccount({
    accountName,
    networkId,
    password,
    mnemonicPhrase,
    action,
  });
  expect(result).toEqual(
    expect.objectContaining({
      success: true,
    })
  );
}

// it('should create an account with name path balance', async () => {
//   const result = await af.createAccount({
//     accountName,
//     networkId,
//     password,
//     mnemonicPhrase,
//     action,
//   });
//   expect(result).toEqual(
//     expect.objectContaining({
//       success: true,
//       data: { accountId: '1234567890000', accountName: 'AccountName', networkId: 'testnet' },
//     })
//   );

//   const state1 = store.getState();
//   expect(state1.account.activeAccountId).toEqual('1234567890000');
//   console.log('accountlist' + JSON.stringify(state1.account.accountList[0].networkId));
//   console.log('accountmap' + JSON.stringify(state1.account.accountMap));
//   console.log('rootpk' + JSON.stringify(state1.pk.rootPk));
//   console.log('map' + JSON.stringify(state1.pk.map));
//   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.name).toEqual('Wallet-0');
//   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.path).toEqual("m/44'/236'/0'/0/0");
//   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.satoshis).toBeNull;
//   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.updatedAt).toBeNull;
//   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.address).toEqual(
//     'mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx'
//   );
//   expect(state1.pk.rootPk.privateKeyHash).toBeDefined;
//   expect(state1.pk.rootPk.privateKeyEncrypted).toBeDefined;

//   const rootKey = restorePK(state1.pk.rootPk.privateKeyHash);
//   const path = "m/44'/236'/0'/0/1";

//   const {
//     address,
//     name,
//     path: fullPath,
//   } = derivePk({
//     rootKey,
//     path,
//   });
//   await dispatchAndValidate(
//     appendPK({
//       address,
//       name,
//       path: fullPath,
//       balance: {
//         satoshis: null,
//         updatedAt: null,
//       },
//     }),
//     s => s.pk.rootPk?.privateKeyHash === rootKey.toString()
//   );
//   console.log('accountmap' + JSON.stringify(state1.account.accountMap));
//   console.log('rootpk' + JSON.stringify(state1.pk.rootPk));
//   console.log('map' + JSON.stringify(state1.pk.map));
// });
