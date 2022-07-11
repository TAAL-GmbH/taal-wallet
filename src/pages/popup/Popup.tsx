import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from '@/src/hooks';
import { PageHead } from '@/src/components/pageHead';
import { RouterComponent } from './RouterComponent';
import { Debug } from '@/src/components/debug/debug';
import { store } from '@/src/store';
import { db } from '@/src/db';
import { isNull, isPopup, isUndefined } from '@/src/utils/generic';
import { sharedDb } from '@/src/db/shared';
import { setAccountList, setActiveAccountId } from '@/src/features/accountSlice';

// let background know we're connected
chrome.runtime.connect();

const Popup = () => {
  const { isInSync, isLocked, rootPk, activePk } = useAppSelector(state => state.pk);
  const [hasRootKey, setHasRootKey] = useState<boolean>(null);
  const [isTosInAgreement, setIsTosInAgreement] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const accounts = await sharedDb.getAccountList();
      store.dispatch(setAccountList(accounts));
      const activeAccountIdFromDb = (await sharedDb.getKeyVal('activeAccountId')) || accounts[0]?.id;
      if (activeAccountIdFromDb) {
        store.dispatch(setActiveAccountId(activeAccountIdFromDb));
      }
      setIsTosInAgreement(!!(await sharedDb.getKeyVal('isTosInAgreement')));
      setIsInitialized(true);
    })();
  }, []);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
    // @ts-ignore
    window.store = store;
    // @ts-ignore
    window.db = db;
    (async () => {
      const activeAccountId = await sharedDb.getKeyVal('activeAccountId');
      if (!isUndefined(activeAccountId)) {
        setHasRootKey(!!(await db.getKeyVal('rootPk.privateKeyEncrypted')));
      } else {
        setHasRootKey(false);
      }
    })();
  }, [isLocked, rootPk]);

  return (
    <Wrapper>
      <Toaster />
      <PageHead hasRootKey={hasRootKey} />

      <RouterComponent
        isInitialized={isInitialized}
        isTosInAgreement={isTosInAgreement}
        isInSync={isInSync}
        hasRootKey={hasRootKey}
        isLocked={isLocked}
        hasActivePk={!isNull(activePk)}
      />

      <Debug />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem;
`;

export default Popup;
