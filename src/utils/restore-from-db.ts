import { db } from '@/db';
import { networkList } from '@/constants/network-list';
import { setAccountList, setActiveAccountId } from '@/features/account-slice';
import { setIsNotified, setState } from '@/features/pk-slice';
import { sharedDb } from '@/db/shared';
import { store } from '@/store';

export const restoreDataFromDb = async () => {
  const [pkMap, activePkAddress, isNotifiedToBackupPassphrase, accountList, activeAccountId] =
    await Promise.all([
      db.getPkMap(),
      db.getKeyVal('active.PkAddress'),
      db.getKeyVal('isNotified.toBackupPassphrase'),
      sharedDb.getAccountList(),
      sharedDb.getKeyVal('activeAccountId'),
    ]);

  const networkId = accountList.find(account => account.id === activeAccountId)?.networkId;

  store.dispatch(setAccountList(accountList));
  store.dispatch(setActiveAccountId(activeAccountId || accountList[0]?.id));
  store.dispatch(setIsNotified({ toBackupPassphrase: !!isNotifiedToBackupPassphrase }));

  store.dispatch(
    setState({
      network: networkList.find(network => network.id === networkId),
      activePk: activePkAddress ? pkMap[activePkAddress] : null,
      map: pkMap,
      rootPk: null,
    })
  );
};
