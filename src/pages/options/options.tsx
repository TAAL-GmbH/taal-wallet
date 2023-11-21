import React, { FC, useEffect } from 'react';
import { AppLogo } from '@/components/app-logo';
import styled from 'styled-components';
import { ClientList } from './client-list';
import { isPopup } from '@/utils/generic';
import { Route, Router } from 'wouter';
import { useHashLocation } from '@/hooks/use-hash-location';
import { AnchorLink } from '@/components/anchor-link';
import { Debug } from '@/components/debug/debug';
import { MinimalLayout } from '@/components/layout/minimal-layout';

const routes = {
  ACL: '/',
  ACCOUNT: '/account',
};

export const Options: FC = () => {
  useEffect(() => {
    document.body.classList.add(isPopup() ? 'main-app-in-popup' : 'main-app-in-tab');
  }, []);

  return (
    <MinimalLayout>
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
    </MinimalLayout>
  );
};

const Tabs = styled.ul`
  display: flex;
  list-style: none;
  flex-direction: row;
  padding: 0;
  margin-top: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[200]};

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
