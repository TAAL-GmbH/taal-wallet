import { FC } from 'react';
import { Route, Router, Switch } from 'wouter';

import { History } from '@/components/history';
import { Home } from '@/components/home';
import { PageLoading } from '@/components/loading-page';
import { ReceiveBSV } from '@/components/receive-bsv';
import { SendBSV } from '@/components/send-bsv';
import { Tokens } from '@/components/tokens';
import { Unlock } from '@/components/unlock';
import { WebPushSubscription } from '@/components/web-push-subscription';
import { routes } from '@/constants/routes';
import { useHashLocation } from '@/hooks/use-hash-location';
import { Onboarding } from '@/components/onboarding';
import { ErrorPage } from '@/components/error-page';
import { TokenDetails } from '@/components/token-details';
import { WalletList } from '@/components/wallet-list';
import { AccountList } from '@/components/account-list';
import { getLocationPath, navigateTo } from '@/utils/navigation';
import { SterileLayout } from '@/components/layout/sterile-layout';
import { BlockingNotification } from '@/components/blocking-notification';
// import { TransferToken } from '@/components/transfer-token';

type Props = {
  isLoading: boolean;
  hasRootKey: boolean;
  isLocked: boolean | null;
  hasAccounts: boolean;
  activeAccountId: string;
  shouldNotify: boolean;
};

export const RouterComponent: FC<Props> = ({
  isLoading,
  hasRootKey,
  isLocked,
  hasAccounts,
  activeAccountId,
  shouldNotify,
}) => {
  const [location] = useHashLocation();

  if (location === routes.ERROR) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return (
      <SterileLayout showBackButton={false} showBurgerMenu={false} showTopHeader={false}>
        <PageLoading />
      </SterileLayout>
    );
  }

  if (activeAccountId && !hasRootKey) {
    return <ErrorPage>Invalid account</ErrorPage>;
  }

  if (!hasAccounts) {
    if (!getLocationPath().startsWith(routes.ONBOARDING)) {
      navigateTo(routes.ONBOARDING);
      return null;
    }
    return (
      <Router hook={useHashLocation}>
        <Switch>
          <Route>
            <Onboarding isInitial />
          </Route>
        </Switch>
      </Router>
    );
  }

  if (isLocked === true) {
    return (
      <Router hook={useHashLocation}>
        <Switch>
          <Route path={`${routes.ACCOUNT_LIST}`}>
            <AccountList />
          </Route>
          <Route path={`${routes.ONBOARDING}/:any*`}>
            <Onboarding />
          </Route>
          <Route>
            <Unlock />
          </Route>
        </Switch>
      </Router>
    );
  }

  if (shouldNotify) {
    return <BlockingNotification />;
  }

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path={`${routes.WALLET_LIST}`}>
          <WalletList />
        </Route>
        <Route path={`${routes.ACCOUNT_LIST}`}>
          <AccountList />
        </Route>
        <Route path={`${routes.SEND_BSV}`}>
          <SendBSV />
        </Route>
        {/* <Route path={`${routes.TRANSFER_TOKEN}/:issuanceTxId?`}>
          {({ issuanceTxId }: { issuanceTxId?: string }) => <TransferToken issuanceTxId={issuanceTxId} />}
        </Route> */}
        <Route path={`${routes.RECEIVE_BSV}`}>
          <ReceiveBSV />
        </Route>
        <Route path={routes.HISTORY}>
          <History />
        </Route>
        <Route path={routes.TOKENS}>
          <Tokens type="fungible" />
        </Route>
        <Route path={routes.NFT}>
          <Tokens type="nft" />
        </Route>
        <Route path={routes.WEB_PUSH}>
          <WebPushSubscription />
        </Route>
        <Route path={`${routes.ONBOARDING}/:any*`}>
          <Onboarding />
        </Route>
        <Route path={`${routes.TOKENS}/:tokenId/:symbol`}>
          {(props: { tokenId: string; symbol: string }) => <TokenDetails {...props} />}
        </Route>
        <Route>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
};
