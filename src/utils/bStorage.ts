import { PK_CURRENT_KEY, PK_LIST_KEY } from '../constants';
import { BStorePKType } from '../types';

type AvailableKeys = typeof PK_CURRENT_KEY | typeof PK_LIST_KEY;

type SetPayload = {
  [PK_CURRENT_KEY]?: BStorePKType | null;
  [PK_LIST_KEY]?: BStorePKType[];
};

class BStore {
  public set(data: SetPayload) {
    return chrome.storage.local.set(data);
  }

  public async get<T>(key?: AvailableKeys | AvailableKeys[]): Promise<T> {
    const result = await chrome.storage.local.get(key);
    return typeof key === 'string' ? result[key] : result;
  }

  public addListener(
    fn: (changes: Record<string, chrome.storage.StorageChange>) => void
  ) {
    return chrome.storage.onChanged.addListener(fn);
  }
}

export const bStore = new BStore();
