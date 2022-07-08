import React, { FC, useEffect } from 'react';
import { AppLogo } from '@/src/components/appLogo';
import styled from 'styled-components';
import { ClientList } from './ClientList';
import { isPopup } from '@/src/utils/generic';
import { useAppSelector } from '@/src/hooks';
import { Route, Router } from 'wouter';
import { useHashLocation } from '@/src/hooks/useHashLocation';
import { AnchorLink } from '@/src/components/anchorLink';
import { AccountSettings } from '@/src/components/accountSettings';
import { Debug } from '@/src/components/debug/debug';

const routes = {
  ACL: '/',
  ACCOUNT: '/account',
};

export const Options: FC = () => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);

  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
  }, []);

  return (
    <Wrapper>
      <AppLogo />

      <Tabs>
        <li>
          <AnchorLink href={`#${routes.ACL}`}>Access Control List</AnchorLink>
        </li>
      </Tabs>

      <section>
        <Router hook={useHashLocation}>
          <Route>
            <ClientList />
          </Route>
        </Router>
      </section>

      <Debug />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
`;

const Tabs = styled.ul`
  display: flex;
  list-style: none;
  flex-direction: row;
  padding: 0;
  margin-top: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.neutral[200]};

  li {
    a {
      display: block;
      min-width: 150px;
      text-align: center;
      border-bottom: 3px solid transparent;
      color: ${({ theme }) => theme.color.grey[500]};
      font-size: 1.1rem;

      &:hover {
        text-decoration: none;
      }

      &.active {
        font-weight: bold;
        color: ${({ theme }) => theme.color.primary[500]};
        border-color: ${({ theme }) => theme.color.primary[400]};
      }
    }
  }
`;
