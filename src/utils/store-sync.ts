import { detailedDiff } from 'deep-object-diff';

import { db } from '@/db';
import { RootState, store } from '@/store';
import { lockWallet, setRootPK, setState } from '@/features/pk-slice';
import { isNull, isString, isUndefined } from '@/utils/generic';
import { PKType } from '@/types';
import { sharedDb } from '@/db/shared';

import { ROOT_PK_HASH_KEY } from '@/constants';
import { sessionStorage } from '@/utils/chrome-storage';
import { waitForTruthy } from '@/utils/wait-for-truthy';
import { restoreDataFromDb } from './restore-from-db';

const isProd = process.env.NODE_ENV === 'production';

type DiffType = {
  updated: RootState['pk'] & RootState['account'];
  deleted: RootState['pk'] & RootState['account'];
  added: RootState['pk'] & RootState['account'];
};

let isStoreSyncInitialized = false;

export const initStoreSync = async () => {
  if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
    throw new Error('initStoreSync must be run in background.js only');
  }

  const activeAccountId = await sharedDb.getKeyVal('activeAccountId');
  if (!activeAccountId) {
    console.info('No active account. First run? Skipping store sync');
    store.dispatch(setState({ isStateInitialized: true }));
    return;
  }

  // we don't initialize storeSync before first account gets created
  // and we call initStoreSync on account creation also
  if (isStoreSyncInitialized) {
    return;
  }
  // console.log('initializing store sync');
  isStoreSyncInitialized = true;

  /**
   * The following code it to keep in sync redux state -> db
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

    // const changes = [
    //   Object.keys(added).length && 'added',
    //   Object.keys(deleted).length && 'deleted',
    //   Object.keys(updated).length && 'updated',
    // ].filter(Boolean);

    // if (changes.length) {
    //   console.log(`store ${changes.join(', ')}`, {
    //     ...(added || {}),
    //     ...(deleted || {}),
    //     ...(updated || {}),
    //   });
    // }

    if (added.map) {
      let highestDerivationPathIndex = (await db.getKeyVal('derivationPath.lastIndex')) || 0;

      Object.values(added.map).forEach((pk: PKType) => {
        // don't write to db if it's only a balance update
        if (!pk.address || !pk.path) {
          return;
        }

        // TODO: check if we really need to write pk to db
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
      } else if (isNull(updated.activePk)) {
        db.setKeyVal('active.PkAddress', null);
      }
    }

    if (updated.rootPk?.privateKeyEncrypted) {
      db.setKeyVal('rootPk.privateKeyEncrypted', updated.rootPk.privateKeyEncrypted);
    }

    if (!isUndefined(updated.isLocked)) {
      const fileNameSuffix = isProd ? '' : '-dev';
      chrome.action.setIcon({
        path: updated.isLocked
          ? `/taal-round-locked4${fileNameSuffix}-128x128.png`
          : `/taal-round${fileNameSuffix}-128x128.png`,
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

  // initial run
  await restoreDataFromDb();

  const rootPkHash = await sessionStorage.get(ROOT_PK_HASH_KEY);

  if (rootPkHash && isString(rootPkHash)) {
    store.dispatch(
      setRootPK({
        privateKeyHash: rootPkHash,
        privateKeyEncrypted: await db.getKeyVal('rootPk.privateKeyEncrypted'),
      })
    );
  } else {
    store.dispatch(lockWallet());
  }

  // TODO: check if we really need to do this every time
  const isLockedIsDefined = await waitForTruthy(() => !isUndefined(store.getState().pk.isLocked));
  if (isLockedIsDefined) {
    store.dispatch(setState({ isStateInitialized: true }));
  } else {
    console.error('isLocked is undefined');
  }
};
