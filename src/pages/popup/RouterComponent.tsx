import { DerivePk } from '@/src/components/derivePK';
import { Home } from '@/src/components/home';
import { PKList } from '@/src/components/pkList';
import { SendBSV } from '@/src/components/sendBsv';
import { Unlock } from '@/src/components/unlock';
import { WebPushSubscription } from '@/src/components/webPushSubscription';
import { routes } from '@/src/constants/routes';
import { useHashLocation } from '@/src/hooks/useHashLocation';
import { isNull } from '@/src/utils/generic';
import { FC } from 'react';
import { Route, Router } from 'wouter';
import { Onboarding } from '../onboarding';
import { OnboardingImport } from '../onboarding/import';
import { OnboardingNew } from '../onboarding/new';

type Props = {
  isInSync: boolean;
  hasMasterKey: boolean;
  isLocked: boolean;
  hasActivePk: boolean;
};

export const RouterComponent: FC<Props> = ({
  isInSync,
  hasMasterKey,
  isLocked,
  hasActivePk,
}) => {
  if (!isInSync || isNull(hasMasterKey)) {
    return <>Loading...</>;
  }

  if (!hasMasterKey) {
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
      <Route path={routes.DERIVE_PK}>
        <DerivePk />
      </Route>
      <Route path={routes.WEB_PUSH}>
        <WebPushSubscription />
      </Route>
    </Router>
  );
};