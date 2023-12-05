import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import { useAppSelector } from '@/hooks';
import { db } from '@/db';
import { isNull, isPopup, isUndefined } from '@/utils/generic';
import { sharedDb } from '@/db/shared';
import { AccountCreationStatus } from '@/components/account-creation-status';
import { getNotifications } from '@/utils/get-notifications';

import { RouterComponent } from './router-component';

let portTimer: NodeJS.Timeout;

const Popup = () => {
  const { isInSync, isLocked, rootPk } = useAppSelector(state => state.pk);
  const { activeAccountId } = useAppSelector(state => state.account);
  const [hasRootKey, setHasRootKey] = useState<boolean>(null);
  const [isUiInitialized, setIsUiInitialized] = useState<boolean>(false);
  const [hasAccounts, setHasAccounts] = useState<boolean>(null);
  const [shouldNotify, setShouldNotify] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(true);
  const port = useRef<chrome.runtime.Port>(null);

  const initPort = useCallback(() => {
    port.current = chrome.runtime.connect();

    portTimer = setInterval(() => {
      port.current.postMessage({ payload: 'ping' });
    });

    return () => {
      clearInterval(portTimer);
      port.current.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');

    initPort();

    setIsUiInitialized(true);

    setTimeout(() => {
      if (isLoadingRef.current) {
        // this could happen after extension update
        (async () => {
          const activeAccountIdFromDb = await sharedDb.getKeyVal('activeAccountId');
          if (isUndefined(activeAccountIdFromDb)) {
            const accountList = await sharedDb.getAccountList();
            if (accountList.length > 0) {
              await sharedDb.setKeyVal('activeAccountId', accountList[0].id);
              chrome.runtime.reload();
            }
          }
        })();
      }
    }, 5000);
  }, []);

  useEffect(() => {
    (async () => {
      setHasAccounts((await sharedDb.getAccountList()).length > 0);

      const activeAccountIdFromDb = await sharedDb.getKeyVal('activeAccountId');

      if (!isUndefined(activeAccountIdFromDb)) {
        setHasRootKey(!!(await db.getKeyVal('rootPk.privateKeyEncrypted')));
      } else {
        setHasRootKey(false);
      }

      if (activeAccountId) {
        setShouldNotify((await getNotifications()) !== null);
      }
    })();
  }, [rootPk, activeAccountId]);

  const allRequiredProps = {
    isUiInitialized,
    isInSync,
    hasAccounts,
    hasRootKey,
    isLocked: hasAccounts === false ? false : isLocked,
    shouldNotify,
  };

  isLoadingRef.current = Object.values(allRequiredProps).some(isNull);

  return (
    <>
      <Toaster />

      <AccountCreationStatus />

      <RouterComponent
        isLoading={isLoadingRef.current}
        hasRootKey={hasRootKey}
        hasAccounts={hasAccounts}
        isLocked={isLocked}
        activeAccountId={activeAccountId}
        shouldNotify={shouldNotify}
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
