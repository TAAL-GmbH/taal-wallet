import { Button } from '@/src/components/button';
import { DerivePk } from '@/src/components/derivePK';
import { History } from '@/src/components/history';
import { Home } from '@/src/components/home';
import { PageLoading } from '@/src/components/loadingPage';
import { PKList } from '@/src/components/pkList';
import { ReceiveBSV } from '@/src/components/receiveBSV';
import { SendBSV } from '@/src/components/sendBSV';
import { Tokens } from '@/src/components/tokens';
import { Unlock } from '@/src/components/unlock';
import { WebPushSubscription } from '@/src/components/webPushSubscription';
import { routes } from '@/src/constants/routes';
import { useHashLocation } from '@/src/hooks/useHashLocation';
import { isNull } from '@/src/utils/generic';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Route, Router } from 'wouter';
import { Onboarding } from '../onboarding';
import { OnboardingImport } from '../onboarding/import';
import { OnboardingNew } from '../onboarding/new';

type Props = {
  isInSync: boolean;
  hasRootKey: boolean;
  isLocked: boolean;
  hasActivePk: boolean;
};

let reloadTimer: ReturnType<typeof setTimeout> | null = null;

export const RouterComponent: FC<Props> = ({ isInSync, hasRootKey, isLocked, hasActivePk }) => {
  const [showReloadCta, setShowReloadCta] = useState(false);

  useEffect(() => {
    if (!isInSync || isNull(hasRootKey)) {
      reloadTimer = setTimeout(() => {
        setShowReloadCta(true);
      }, 1000);
    } else {
      clearTimeout(reloadTimer);
    }
  }, [isInSync, hasRootKey]);

  if (showReloadCta) {
    return (
      <ErrorMessage>
        <div>Oops, something went wrong!</div>
        <Button onClick={() => chrome.runtime.reload()}>Reload wallet</Button>
        <pre>{JSON.stringify({ isInSync, hasRootKey }, null, 2)}</pre>
      </ErrorMessage>
    );
  }

  // isNull(hasRootKey) === true means we're still fetching the root key from db
  if (!isInSync || isNull(hasRootKey)) {
    return <PageLoading />;
  }

  if (!hasRootKey) {
    return (
      <Router hook={useHashLocation}>
        <Route>
          <Onboarding />
        </Route>
        <Route path={`${routes.ONBOARDING_NEW}`}>
          <OnboardingNew />
        </Route>
        <Route path={`${routes.ONBOARDING_IMPORT}`}>
          <OnboardingImport />
        </Route>
      </Router>
    );
  }

  if (isLocked) {
    return <Unlock />;
  }

  if (!hasActivePk) {
    return <PKList />;
  }

  return (
    <Router hook={useHashLocation}>
      <Route path="/">
        <Home />
      </Route>
      <Route path={`${routes.PK_LIST}`}>
        <PKList />
      </Route>
      <Route path={`${routes.SEND_BSV}`}>
        <SendBSV />
      </Route>
      <Route path={`${routes.RECEIVE_BSV}`}>
        <ReceiveBSV />
      </Route>
      <Route path={routes.DERIVE_PK}>
        <DerivePk />
      </Route>
      <Route path={routes.HISTORY}>
        <History />
      </Route>
      <Route path={routes.TOKENS}>
        <Tokens />
      </Route>
      <Route path={routes.WEB_PUSH}>
        <WebPushSubscription />
      </Route>
      <Route path={`${routes.ONBOARDING_NEW}`}>
        <OnboardingNew />
      </Route>
      <Route path={`${routes.ONBOARDING_IMPORT}`}>
        <OnboardingImport />
      </Route>
    </Router>
  );
};

const ErrorMessage = styled.div`
  font-size: 1rem;
  margin: 4rem 0 2rem;
  text-align: center;

  > div {
    margin-bottom: 1rem;
  }
`;
