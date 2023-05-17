import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from '@/src/hooks';
import { PageHead } from '@/src/components/pageHead';
import { RouterComponent } from './RouterComponent';
import { Debug } from '@/src/components/debug/debug';
import { db } from '@/src/db';
import { isNull, isPopup, isUndefined } from '@/src/utils/generic';
import { sharedDb } from '@/src/db/shared';
import { AccountCreationStatus } from '@/src/components/accountCreationStatus';

// let background know we're connected
chrome.runtime.connect();

const Popup = () => {
  const { isInSync, isLocked, rootPk, activePk } = useAppSelector(state => state.pk);
  const { activeAccountId } = useAppSelector(state => state.account);
  const [hasRootKey, setHasRootKey] = useState<boolean>(null);
  const [isTosInAgreement, setIsTosInAgreement] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
    (async () => {
      setIsTosInAgreement(!!(await sharedDb.getKeyVal('isTosInAgreement')));
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
    <Wrapper>
      <Toaster />
      <PageHead hasRootKey={hasRootKey} />

      <AccountCreationStatus />

      <RouterComponent
        isInitialized={isInitialized}
        isTosInAgreement={isTosInAgreement}
        isInSync={isInSync}
        hasRootKey={hasRootKey}
        isLocked={isLocked}
        hasActivePk={!isNull(activePk)}
        activeAccountId={activeAccountId}
      />

      <Debug
        extra={[
          {
            isInitialized,
            isTosInAgreement,
            isInSync,
            hasRootKey,
            isLocked,
            hasActivePk: !isNull(activePk),
          },
        ]}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem;
`;

export default Popup;
