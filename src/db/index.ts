import { openDB, DBSchema, IDBPDatabase, StoreNames } from 'idb';
import { OriginType, PKType } from '../types';

const CURRENT_DB_VERSION = 1;
const DB_NAME_PREFIX = 'Taal-web3-wallet';
const SHARED_DB_NAME = `${DB_NAME_PREFIX}-shared`;
const ACCOUNT_DB_NAME_PREFIX = `${DB_NAME_PREFIX}-account`;
const DEFAULT_ACCOUNT_DB_NAME = `${ACCOUNT_DB_NAME_PREFIX}-0`;

export const storeNames = {
  KEY_VAL: 'keyVal',
  PK: 'pk',
  ORIGIN: 'origin',
} as const;

type KeyValAccountKey =
  | 'active.PkAddress'
  | 'derivationPath.lastIndex'
  | 'rootPk.privateKeyEncrypted'
  | 'network.id'
  | 'account.name'
  | 'account.passwordHash';
type KeyValSharedKey = 'activeAccountIndex';

interface TaalSharedDB extends DBSchema {
  [storeNames.KEY_VAL]: {
    key: string;
    value: string | number | boolean | null;
  };
}

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
  _db: IDBPDatabase<TaalAccountDB> | null;
  _activeDbName = DEFAULT_ACCOUNT_DB_NAME;

  constructor() {
    this._getDB().then(db => (this._db = db));
  }

  private async _getDB() {
    return (
      this._db ||
      openDB<TaalAccountDB>(this._activeDbName, CURRENT_DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(storeNames.KEY_VAL);
          db.createObjectStore(storeNames.ORIGIN, { keyPath: 'origin' });

          const productStore = db.createObjectStore(storeNames.PK, {
            keyPath: 'address',
          });
          productStore.createIndex('by-path', 'path');
        },
      })
    );
  }

  private async _getSharedDB() {
    return openDB<TaalAccountDB>(SHARED_DB_NAME, CURRENT_DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(storeNames.KEY_VAL);
      },
    });
  }

  private async _getStore<T extends StoreNames<TaalAccountDB>>(storeName: T) {
    const db = await this._getDB();
    return db.transaction(storeName).objectStore(storeName);
  }

  public async getAccountList(resolveNames = true) {
    const dbList = await indexedDB.databases();
    const accountList = dbList.filter(item =>
      item.name.startsWith(ACCOUNT_DB_NAME_PREFIX)
    );

    const dbNameToRestore = this._activeDbName;

    const getAccountName = async (index: number) => {
      await this.useAccount(index);
      const accountName = await this.getKeyVal('account.name');
      return typeof accountName === 'string' ? accountName : `Account ${index}`;
    };

    const promises = accountList.map(async (item, index) => {
      return {
        dbName: item.name,
        accountName: resolveNames ? await getAccountName(index) : '',
        version: item.version,
      };
    });

    this._activeDbName = dbNameToRestore;

    return Promise.all(promises);
  }

  public async useAccount(index: number) {
    const dbName = `${ACCOUNT_DB_NAME_PREFIX}-${index}`;
    const accountDbList = await this.getAccountList(false);
    if (!accountDbList.find(item => item.dbName === dbName)) {
      console.error(`Account #${index} not found!`, { accountDbList });
      throw new Error(`Account #${index} not found!`);
    }
    this._activeDbName = dbName;
    this._db = null;
    await this._getDB();
  }

  public async getSharedKeyVal(key: KeyValSharedKey) {
    const db = await this._getSharedDB();
    return db.get(storeNames.KEY_VAL, key);
  }

  public async setSharedKeyVal(
    key: KeyValSharedKey,
    value: TaalSharedDB['keyVal']['value']
  ) {
    const db = await this._getSharedDB();
    return db.put(storeNames.KEY_VAL, value, key);
  }

  public async getKeyVal(key: KeyValAccountKey) {
    const db = await this._getDB();
    return db.get(storeNames.KEY_VAL, key);
  }

  public async setKeyVal(
    key: KeyValAccountKey,
    value: TaalAccountDB['keyVal']['value']
  ) {
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

    var range = IDBKeyRange.bound(
      `m/44/236/0/0/${start}`,
      `m/44/236/0/0/${end}`
    );
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
