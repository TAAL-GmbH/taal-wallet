import { ROOT_PK_HASH_KEY } from '@/constants';

type AvailableKeys = typeof ROOT_PK_HASH_KEY;

type SetPayload = {
  [ROOT_PK_HASH_KEY]?: string;
};

class Storage {
  private area: 'local' | 'session';

  constructor(storeType: typeof Storage.prototype.area) {
    this.area = storeType;
  }

  public set(data: SetPayload) {
    return chrome.storage[this.area].set(data);
  }

  public async get<T>(key?: AvailableKeys | AvailableKeys[]): Promise<T> {
    const result = await chrome.storage[this.area].get(key);
    return typeof key === 'string' ? result[key] : result;
  }

  public async remove(key: AvailableKeys | AvailableKeys[]) {
    return chrome.storage[this.area].remove(key);
  }

  public addListener(fn: (changes: Record<string, chrome.storage.StorageChange>) => void) {
    return chrome.storage[this.area].onChanged.addListener(fn);
  }
}

export const sessionStorage = new Storage('session');
