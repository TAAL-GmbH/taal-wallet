import { OriginType, PKType } from '@/src/types';
import { _db } from './dbState';
import { sharedDb } from './shared';

const ACCOUNT_DB_NAME_PREFIX = `Account`;

export const storeNames = {
  KEY_VAL: 'keyVal',
  PK: 'pk',
  ORIGIN: 'origin',
} as const;

export type KeyVal = {
  'active.PkAddress': string | null;
  'derivationPath.lastIndex': number;
  'rootPk.privateKeyEncrypted': string | null;
  'network.id': string | null;
  'account.name': string | null;
  'account.passwordHash': string | null;
};

class Db {
  constructor() {}

  public async deleteAccountDb(accountId: string) {
    const dbName = `${ACCOUNT_DB_NAME_PREFIX}-${accountId}`;
    return dbName;
  }

  public async useAccount(accountId: string, create?: boolean) {
    sharedDb.setKeyVal('activeAccountId', accountId);
  }

  public async getKeyVal<T extends keyof KeyVal>(key: T) {
    return _db.keyVal[key];
  }

  public async setKeyVal<T extends keyof KeyVal>(key: T, value: KeyVal[typeof key]) {
    _db.keyVal[key] = value;
  }

  public async getPkMap() {
    return _db.pkMap;
  }

  public async insertPk(pk: PKType) {
    _db.pkMap = {
      ..._db.pkMap,
      [pk.address]: pk,
    };
  }

  public async updatePk(pk: PKType) {
    this.insertPk(pk);
  }

  public async deletePk(address: string) {
    delete _db.pkMap[address];
  }

  public async getOrigin(origin: string) {
    const result: OriginType = {
      origin: 'localhost',
      isAuthorized: true,
      isPersistent: true,
    };
    return result;
  }
}

export const db = new Db();
