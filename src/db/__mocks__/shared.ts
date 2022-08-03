import { AccountType } from '@/src/types';
import { _sharedDb as _db } from './dbState';

export const storeNames = {
  KEY_VAL: 'keyVal',
  PK: 'pk',
  ORIGIN: 'origin',
} as const;

export type KeyVal = {
  isTosInAgreement: boolean;
  activeAccountId: string;
  walletLockPeriod: number;
};

class Shared {
  private _activeDbName: string;

  constructor() {}

  public insertAccount(account: AccountType) {
    _db.accountMap = {
      ..._db.accountMap,
      [account.id]: account,
    };
  }

  public async deleteAccount(accountId: string) {
    delete _db.accountMap[accountId];
  }

  public async getAccountList() {
    return Object.values(_db.accountMap);
  }

  public async getAccount(accountId: string) {
    return _db.accountMap[accountId];
  }

  public async getKeyVal<T extends keyof KeyVal>(key: T) {
    return _db.keyVal[key];
  }

  public async setKeyVal<T extends keyof KeyVal>(key: T, value: KeyVal[typeof key]) {
    _db.keyVal[key] = value;
  }
}

export const sharedDb = new Shared();
