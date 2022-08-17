jest.mock('../features/wocApi');
jest.mock('../db/index.ts');
jest.mock('../db/shared.ts');

import { derivePk, restorePK } from './../utils/blockchain';
import { AccountFactory } from '../utils/accountFactory';
import { initStoreSync } from '../utils/storeSync';
import * as wocApi from '../features/wocApi';
import { store } from '../store';
import { appendPK } from '../features/pkSlice';
import { dispatchAndValidate } from '../utils/dispatchAndValidate';

let accountName = 'AccountName';
let networkId = 'testnet';
const password = 'password';
let mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk boring';
//const mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk test';
//const mnemonicPhrase = 'ensure ribbon tell sock short citizen staff owner scissors chair rib similar';
// const action = 'importExisting'; // 'createNew';
const action = 'createNew';

describe('accountFactory', () => {
  let af: AccountFactory;
  let dateNowSpy: jest.SpyInstance<number>;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1234567890000);
    initStoreSync();
  });

  beforeEach(() => {
    af = new AccountFactory();
    mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk boring';
    networkId = 'testnet'
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
      expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.amount).toBeNull;
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

    it('should import an existing wallet with a bsv balance', async () => {
      let mnemonicPhrase = 'ensure ribbon tell sock short citizen staff owner scissors chair rib similar'
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
          data: { accountId: '1234567890000', accountName: 'AccountName', networkId: 'testnet'},
        })
      );
      const state1 = store.getState();
      console.log(state1.pk.activePk.balance.amount)
      expect(state1.pk.activePk.balance.amount).toEqual(1000000)
    }, 60000);


    test.each([
      networkId = 'mainnet',
      networkId = 'testnet',
    ])(`should attempt to import a wallet with invalid seed phrase on different networks`, async () => {
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
          error: { message: `Mnemonic string is invalid: ${mnemonicPhrase}`},
        })
      );
      const state1 = store.getState();
      expect(state1.pk.activePk).toBe(null)
    });

    it('should attempt to create an account with invalid password', async () => {
      const result = await af.createAccount({
        accountName,
        networkId, 
        password: '1',
        mnemonicPhrase,
        action,
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: { message: `Password must be at least 8 characters in length`},
        })
      );
    });

  it('should attempt to create account with blank account name', async () => {
    let accountName = ''
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
          error: { message: `Account Name cannot be blank`},
        })
      );
    });
  });
});


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
    //   expect(state1.pk.map.mxF2S1u2VVb117RpPjmMqUoViEM7zU1vAx.balance.amount).toBeNull;
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
    //         amount: null,
    //         updatedAt: null,
    //       },
    //     }),
    //     s => s.pk.rootPk?.privateKeyHash === rootKey.toString()
    //   );
    //   console.log('accountmap' + JSON.stringify(state1.account.accountMap));
    //   console.log('rootpk' + JSON.stringify(state1.pk.rootPk));
    //   console.log('map' + JSON.stringify(state1.pk.map));
    // });
