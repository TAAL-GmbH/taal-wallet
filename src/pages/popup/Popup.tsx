import React, { useEffect } from 'react';
import { Router, Route } from 'wouter';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { PKList } from '@/src/components/pkList';
import { useHashLocation } from '@/src/hooks/useHashLocation';
import { NewPk } from '@/src/components/newPK';
import { Home } from '@/src/components/home';
import { PageHead } from '@/src/components/pageHead';
import { routes } from '@/src/constants/routes';
import { WebPushSubscription } from '@/src/components/webPushSubscription';

const Popup = () => {
  useEffect(() => {
    (async () => {
      await pk.init('popup');
    })();
  }, []);

  // const refreshBalanceListener = resp => {
  //   setSatoshis(resp.satoshis);
  //   setTokens(resp.tokenBalances);
  // };

  // const refreshBalance = () => {
  //   woc.balanceAsync({ refreshBalanceListener }, pk.address);
  // };

  return (
    <Wrapper>
      <PageHead margin="0 0 md" />

      <Router hook={useHashLocation}>
        <Route path="/">
          <Home />
        </Route>
        <Route path={`${routes.PK_LIST}`}>
          <PKList />
        </Route>
        <Route path={routes.CREATE_PK}>
          <NewPk />
        </Route>
        <Route path={routes.WEB_PUSH}>
          <WebPushSubscription />
        </Route>
      </Router>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem;
  width: 350px;
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default Popup;
