import { db } from '../db';
import { RootState, store } from '../store';
import { detailedDiff } from 'deep-object-diff';
import { setState } from '../features/pkSlice';
import { isNull, isUndefined } from './generic';
import { PKType } from '../types';
import { networkList } from '../constants/networkList';
import { sharedDb } from '../db/shared';
import { setAccountList, setActiveAccountId } from '../features/accountSlice';

type DiffType = {
  updated: RootState['pk'] & RootState['account'];
  deleted: RootState['pk'] & RootState['account'];
  added: RootState['pk'] & RootState['account'];
};

export const initStoreSync = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('initStoreSync must be run in background.js only');
  }

  /**
   * The following code it to keep in sync redux state -> chrome.storage.pk
   */
  const previousState: Partial<RootState> = {
    pk: store.getState().pk,
    account: store.getState().account,
  };

  store.subscribe(async () => {
    const { pk, account } = store.getState();
    const { added, deleted, updated } = detailedDiff(
      { ...previousState.pk, ...previousState.account },
      { ...pk, ...account }
    ) as DiffType;

    // if (Object.keys(added).length || Object.keys(deleted).length || Object.keys(updated).length) {
    //   console.log('store.subscribe', {
    //     added,
    //     deleted,
    //     updated,
    //   });
    // }

    if (added.map) {
      let highestDerivationPathIndex = (await db.getKeyVal('derivationPath.lastIndex')) || 0;

      Object.values(added.map).forEach((pk: PKType) => {
        db.insertPk(pk);

        const pathSegments = pk.path.split('/');
        const lastSegment = parseInt(pathSegments[pathSegments.length - 1]);
        if (lastSegment > highestDerivationPathIndex) {
          highestDerivationPathIndex = lastSegment;
        }
      });

      db.setKeyVal('derivationPath.lastIndex', highestDerivationPathIndex);
    }

    if (updated.map) {
      const pkMap = store.getState().pk.map;
      Object.keys(updated.map).forEach(key => db.updatePk(pkMap[key]));
    }

    if (deleted.map) {
      Object.keys(updated.map).forEach(async address => {
        db.deletePk(address);

        const activePkAddress = await db.getKeyVal('active.PkAddress');
        if (activePkAddress === address) {
          db.setKeyVal('active.PkAddress', null);
        }
      });
    }

    if (updated.activePk) {
      if (!isUndefined(updated.activePk?.address)) {
        db.setKeyVal('active.PkAddress', updated.activePk?.address);
      }
      if (isNull(updated.activePk)) {
        db.setKeyVal('active.PkAddress', null);
      }
    }

    if (updated.network?.id) {
      db.setKeyVal('network.id', updated.network.id);
    }

    if (updated.rootPk?.privateKeyEncrypted) {
      db.setKeyVal('rootPk.privateKeyEncrypted', updated.rootPk.privateKeyEncrypted);
    }

    if (!isUndefined(updated.isLocked)) {
      chrome.action.setIcon({
        path: updated.isLocked ? '/taal-round-locked4-128x128.png' : '/taal-round-128x128.png',
      });
    }

    if (updated.accountMap) {
      Object.keys(updated.accountMap).forEach(async accountId => {
        sharedDb.renameAccount(accountId, updated.accountMap[accountId].name);
      });
    }

    previousState.pk = store.getState().pk;
    previousState.account = store.getState().account;
  });

  restoreDataFromDb();
};

export const restoreDataFromDb = async () => {
  /**
   * The following code it to restore data from indexedDB -> redux state
   */

  // const activeAccountId = await sharedDb.getKeyVal('activeAccountId');
  // console.debug('restoreDataFromDb', { activeAccountId });
  // if (isUndefined(activeAccountId)) {
  //   return;
  // }

  const [networkId, pkMap, activePkAddress, accountList, activeAccountId] = await Promise.all([
    db.getKeyVal('network.id'),
    db.getPkMap(),
    db.getKeyVal('active.PkAddress'),
    sharedDb.getAccountList(),
    sharedDb.getKeyVal('activeAccountId'),
  ]);
  console.debug('restoreDataFromDb', { networkId, pkMap, activePkAddress, accountList, activeAccountId });

  store.dispatch(setAccountList(accountList));
  store.dispatch(setActiveAccountId(activeAccountId || accountList[0]?.id));

  store.dispatch(
    setState({
      network: networkList.find(network => network.id === networkId),
      activePk: activePkAddress ? pkMap[activePkAddress as string] : null,
      map: pkMap,
      rootPk: null,
    })
  );
};
