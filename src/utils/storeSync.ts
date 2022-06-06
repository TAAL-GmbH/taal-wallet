import isEqual from 'react-fast-compare';
import { PK_CURRENT_KEY, PK_LIST_KEY } from '../constants';
import { replacePKList, setActivePk } from '../features/pkSlice';
import { pk } from '../libs/PK';
import { store } from '../store';
import { BStorePKType, PKType } from '../types';
import { bStore } from './bStorage';

const storageSyncKeys = [PK_LIST_KEY, PK_CURRENT_KEY];

type BStoreData = {
  [PK_CURRENT_KEY]: BStorePKType;
  [PK_LIST_KEY]: BStorePKType[];
};

export const initStoreSync = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('initStoreSync must be run in background.js only');
  }

  /**
   * The following code it to keep in sync redux state -> chrome.storage.pk
   */
  store.subscribe(async () => {
    const { list, current } = store.getState().pk;

    const bStoreData = await bStore.get<BStoreData>(storageSyncKeys);

    const newStorageData: Parameters<typeof bStore.set>[0] = {};

    if (!isEqual(bStoreData[PK_LIST_KEY], list)) {
      newStorageData[PK_LIST_KEY] = list.map(pk.pkType2BStore);
    }

    if (current) {
      const bStoreTypeCurrent = pk.pkType2BStore(current);
      if (bStoreData[PK_CURRENT_KEY] !== bStoreTypeCurrent) {
        newStorageData[PK_CURRENT_KEY] = pk.pkType2BStore(current);
      }
    }

    if (Object.keys(newStorageData).length) {
      bStore.set(newStorageData);
    }
  });

  /**
   * The following code it to keep in sync chrome.storage.pk -> redux state
   */
  // chrome.storage.onChanged.addListener(
  // bStore.addListener(
  //   // async (changes: { [key: string]: chrome.storage.StorageChange }) => {
  //   async (changes: { [key: string]: chrome.storage.StorageChange }) => {
  //     for (let [key, { newValue }] of Object.entries(changes)) {
  //       if (key === PK_LIST_KEY) {
  //         store.dispatch(replacePKList(newValue as PKType[]));
  //       }
  //       if (key === PK_CURRENT_KEY) {
  //         store.dispatch(setActivePk(newValue));
  //       }
  //     }
  //   }
  // );

  /**
   * The following code it to restore data from chrome.storage.pk -> redux state
   */
  const bStoreData = await bStore.get<BStoreData>(storageSyncKeys);

  if (bStoreData[PK_LIST_KEY]?.length) {
    try {
      const restoredPkList: PKType[] = bStoreData[PK_LIST_KEY].map(
        pk.bStorePK2PKType
      );
      store.dispatch(replacePKList(restoredPkList));
    } catch (err) {
      console.error(`Failed to restore "${PK_LIST_KEY}"`, err);
    }
  }
  if (bStoreData[PK_CURRENT_KEY]) {
    try {
      const restoredCurrentPk = pk.bStorePK2PKType(bStoreData[PK_CURRENT_KEY]);
      store.dispatch(setActivePk(restoredCurrentPk));
    } catch (err) {
      console.error(`Failed to restore "${PK_CURRENT_KEY}"`, err);
    }
  }
};
