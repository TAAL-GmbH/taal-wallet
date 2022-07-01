import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from '@/src/hooks';
import { PageHead } from '@/src/components/pageHead';
import { RouterComponent } from './RouterComponent';
import { Debug } from '@/src/components/debug/debug';
import { store } from '@/src/store';
import { db } from '@/src/db';
import { isNull, isPopup } from '@/src/utils/generic';

const Popup = () => {
  const { isInSync, isLocked, activePk } = useAppSelector(state => state.pk);
  const [hasRootKey, setHasRootKey] = useState<boolean>(null);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
    // @ts-ignore
    window.store = store;
    // @ts-ignore
    window.db = db;
    (async () => {
      setHasRootKey(!!(await db.getKeyVal('rootPk.privateKeyEncrypted')));
    })();
  }, [isLocked]);

  return (
    <Wrapper>
      <Toaster />
      <PageHead />

      <RouterComponent
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
