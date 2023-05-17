import { openDB, DBSchema, IDBPDatabase, StoreNames, deleteDB } from 'idb';
import { OriginType, PKType } from '../types';
import { isBackgroundScript } from '../utils/generic';
import { sharedDb } from './shared';
import { clog } from '../utils/clog';

const CURRENT_DB_VERSION = 1;
export const ACCOUNT_DB_NAME_PREFIX = `Account`;

export const storeNames = {
  KEY_VAL: 'keyVal',
  PK: 'pk',
  ORIGIN: 'origin',
} as const;

type KeyVal = {
  'active.PkAddress': string | null;
  'derivationPath.lastIndex': number;
  'rootPk.privateKeyEncrypted': string | null;
  'network.id': string | null;
  'account.name': string | null;
  'account.passwordHash': string | null;
};

interface TaalAccountDB extends DBSchema {
  [storeNames.KEY_VAL]: {
    key: string;
    value: string | number | boolean | null;
  };
  [storeNames.PK]: {
    key: string; // address
    value: PKType;
    indexes: {
      'by-path': string;
    };
  };
  [storeNames.ORIGIN]: {
    key: string;
    value: OriginType;
  };
}

class Db {
  private _db: IDBPDatabase<TaalAccountDB> | null;
  private _activeDbName: string;
  private _dbPromise: Promise<IDBPDatabase<TaalAccountDB>> | null;

  constructor() {}

  public getName() {
    return this._activeDbName;
  }

  /**
   * This method prevents initializing the db multiple times in parallel.
   */
  private async _openDB() {
    if (!this._dbPromise) {
      this._dbPromise = openDB<TaalAccountDB>(this._activeDbName, CURRENT_DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(storeNames.KEY_VAL);
          db.createObjectStore(storeNames.ORIGIN, { keyPath: 'origin' });

          const pkStore = db.createObjectStore(storeNames.PK, {
            keyPath: 'address',
          });
          pkStore.createIndex('by-path', 'path');
        },
      });
    }
    return this._dbPromise;
  }

  private async _getDB() {
    if (!this._activeDbName) {
      const activeAccountId = await sharedDb.getKeyVal('activeAccountId');
      if (!activeAccountId) {
        console.error(`No active account!`);
        return;
      }

      this._activeDbName = `${ACCOUNT_DB_NAME_PREFIX}-${activeAccountId}`;
      this._db = null;
      this._dbPromise = null;
    }

    if (!this._db) {
      this._db = await this._openDB();
    }

    return this._db;
  }

  private async _getStore<T extends StoreNames<TaalAccountDB>>(storeName: T) {
    const db = await this._getDB();
    return db.transaction(storeName).objectStore(storeName);
  }

  public async deleteAccountDb(accountId: string) {
    const dbName = `${ACCOUNT_DB_NAME_PREFIX}-${accountId}`;
    return deleteDB(dbName);
  }

  public async useAccount(accountId: string, create?: boolean) {
    const dbName = `${ACCOUNT_DB_NAME_PREFIX}-${accountId}`;

    const dbList = await indexedDB.databases();
    const dbExists = !!dbList.find(item => item.name === dbName);

    if (!dbExists && !create) {
      clog.error(`Account #${accountId} not found!`, { dbList });
      throw new Error(`Account #${accountId} not found!`);
    }

    await sharedDb.setKeyVal('activeAccountId', accountId);
    this._activeDbName = dbName;
    this._db = null;
    this._dbPromise = null;

    await this._getDB();

    // tell background script that we are using this account now
    // TODO: switch to long-lived internal communication
    if (!isBackgroundScript()) {
      await chrome.runtime.sendMessage({
        action: 'bg:setAccount',
        payload: accountId,
      });
    }
  }

  public async getKeyVal<T extends keyof KeyVal>(key: T) {
    const db = await this._getDB();
    return db.get(storeNames.KEY_VAL, key) as Promise<KeyVal[typeof key]>;
  }

  public async setKeyVal<T extends keyof KeyVal>(key: T, value: KeyVal[typeof key]) {
    const db = await this._getDB();
    return db.put(storeNames.KEY_VAL, value, key);
  }

  public async getPkByPath(path: string) {
    const db = await this._getDB();
    return db.getFromIndex(storeNames.PK, 'by-path', path);
  }

  public async insertPk(pk: PKType) {
    const db = await this._getDB();
    return db.put(storeNames.PK, pk);
  }

  public async updatePk(pk: PKType) {
    this.insertPk(pk);
  }

  public async deletePk(address: string) {
    const db = await this._getDB();
    return db.delete(storeNames.PK, address);
  }

  public async getCursor<T extends StoreNames<TaalAccountDB>>(
    storeName: T,
    query?: IDBKeyRange | TaalAccountDB[T]['key'] | null | undefined
  ) {
    const db = await this._getDB();
    return db.transaction(storeName).store.openCursor(query);
  }

  public async getOrigin(origin: string) {
    const db = await this._getDB();
    return db.get(storeNames.ORIGIN, origin);
  }

  public async setOrigin(originData: OriginType) {
    const db = await this._getDB();
    return db.put(storeNames.ORIGIN, originData);
  }

  public async deleteOrigin(origin: string) {
    const db = await this._getDB();
    return db.delete(storeNames.ORIGIN, origin);
  }

  public async getOriginMap() {
    const db = await this._getDB();
    return db.getAll(storeNames.ORIGIN);
  }

  public async getOriginList() {
    const originsMap = await this.getOriginMap();
    return Object.values(originsMap);
  }

  public async getPkMap() {
    const pkList = await this.getPkList();
    const pkMap = {};
    for (const pk of pkList) {
      pkMap[pk.address] = pk;
    }
    return pkMap;
  }

  public async getPkList() {
    const db = await this._getDB();
    return db.getAll(storeNames.PK);
  }

  public async test() {
    const start = 0;
    const end = 100;

    const range = IDBKeyRange.bound(`m/44/236/0/0/${start}`, `m/44/236/0/0/${end}`);
    let cursor = await this.getCursor('pk', range);

    const result: Record<string, PKType> = {};

    while (cursor) {
      const key = cursor.key.toString();
      const pathSegments = key.split('/');
      const index = +pathSegments[5];
      if (index >= start && index <= end) {
        result[key] = cursor.value;
      }
      cursor = await cursor.continue();
    }

    console.timeEnd('cursorWithRange');
    console.log({ result, size: Object.keys(result).length, start, end });
  }
}

export const db = new Db();
