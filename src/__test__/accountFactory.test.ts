jest.mock('../features/wocApi');
jest.mock('../db/index.ts');
jest.mock('../db/shared.ts');

import { AccountFactory } from '../utils/accountFactory';
import { initStoreSync } from '../utils/storeSync';
import * as wocApi from '../features/wocApi';
import { store } from '../store';

const accountName = 'AccountName';
const networkId = 'testnet';
const password = 'password';
const mnemonicPhrase = 'cherry target client slush annual width front opera together perfect brisk boring';
// const action = 'importExisting'; // 'createNew';
const action = 'createNew';

describe('accountFactory', () => {
  let af: AccountFactory;
  let dateNowSpy;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1234567890000);
    initStoreSync();
  });

  beforeEach(() => {
    af = new AccountFactory();
    // this disables all delays in AccountFactory
    af.setTimeoutMultiplier(0);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      jest.setTimeout(10000);
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
    }, 15000);
  });
});
