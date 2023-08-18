import { FC } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@/hooks';
import { capitalize } from '@/utils/generic';
import { routes } from '@/constants/routes';

import { Spinner } from '@/components/spinner';
import { AccountIcon } from '@/components/account-icon';

type Props = {
  className?: string;
};

export const Account: FC<Props> = ({ className }) => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);
  const activeAccount = accountMap[activeAccountId];
  const networkName = capitalize(activeAccount?.networkId || 'unknown');

  if (!activeAccount) {
    return <Spinner />;
  }

  return (
    <Wrapper className={className} href={`#${routes.ACCOUNT_LIST}`}>
      <AccountIcon accountId={activeAccountId} />
      <ContentWrapper>
        <Name>{activeAccount.name}</Name>
        <Network>{networkName}</Network>
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.a`
  display: grid;
  grid-template-columns: min-content max-content;
  gap: 8px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
    text-decoration: none;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Name = styled.span`
  ${({ theme }) => theme.typography.heading6};
  color: ${({ theme }) => theme.color.primary[600]};
`;

const Network = styled.span`
  ${({ theme }) => theme.typography.heading8};
  color: ${({ theme }) => theme.color.secondary[600]};
`;
