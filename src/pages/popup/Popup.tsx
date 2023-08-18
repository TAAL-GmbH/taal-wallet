import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import { useAppSelector } from '@/hooks';
import { db } from '@/db';
import { isNull, isPopup, isUndefined } from '@/utils/generic';
import { sharedDb } from '@/db/shared';
import { AccountCreationStatus } from '@/components/account-creation-status';

import { RouterComponent } from './router-component';

// let background know we're connected
chrome.runtime.connect();

const Popup = () => {
  const { isInSync, isLocked, rootPk, activePk } = useAppSelector(state => state.pk);
  const { activeAccountId } = useAppSelector(state => state.account);
  const [hasRootKey, setHasRootKey] = useState<boolean>(null);
  // const [isTosInAgreement, setIsTosInAgreement] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
    (async () => {
      // TODO: remove as it's not needed anymore
      // setIsTosInAgreement(!!(await sharedDb.getKeyVal('isTosInAgreement')));
      setIsInitialized(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const activeAccountIdFromDb = await sharedDb.getKeyVal('activeAccountId');

      if (!isUndefined(activeAccountIdFromDb)) {
        setHasRootKey(!!rootPk || !!(await db.getKeyVal('rootPk.privateKeyEncrypted')));
      } else {
        setHasRootKey(false);
      }
    })();
  }, [isLocked, rootPk, activeAccountId]);

  return (
    <>
      <Toaster />

      <AccountCreationStatus />

      <RouterComponent
        isInitialized={isInitialized}
        isInSync={isInSync}
        hasRootKey={hasRootKey}
        isLocked={isLocked}
        hasActivePk={!isNull(activePk)}
        activeAccountId={activeAccountId}
      />

      {/* <Debug
        extra={[
          {
            isInitialized,
            isInSync,
            hasRootKey,
            isLocked,
            hasActivePk: !isNull(activePk),
          },
        ]}
      /> */}
    </>
  );
};

export default Popup;
