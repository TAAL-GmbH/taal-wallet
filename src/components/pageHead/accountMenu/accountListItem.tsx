import { networkMap } from '@/src/constants/networkList';
import { db } from '@/src/db';
import { setActiveAccountId } from '@/src/features/accountSlice';
import { useAppSelector } from '@/src/hooks';
import { AccountType } from '@/src/types';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { NetworkPill } from '../../networkPill';
import { AccountIcon } from '../../svg/accountIcon';
import { CheckIcon } from '../../svg/checkIcon';

type Props = {
  className?: string;
  account: AccountType;
  onClick: (accountId: string) => void;
};

export const AccountListItem: FC<Props> = ({ className, account, onClick }) => {
  const { activeAccountId } = useAppSelector(state => state.account);

  if (!account?.id) {
    return null;
  }

  const isActive = activeAccountId === account.id;

  return (
    <Wrapper className={className} isActive={isActive}>
      <a href="#" onClick={() => onClick(account.id)}>
        {isActive ? <CheckIcon /> : <AccountIcon />}
        <div>
          <NetworkPill size="xs">{account.networkId}</NetworkPill>
          <div>{account.name}</div>
        </div>
      </a>
    </Wrapper>
  );
};

const Wrapper = styled.li<{ isActive: boolean }>`
  a {
    padding-left: 1rem;
    line-height: 1rem;
  }

  ${({ isActive }) =>
    isActive &&
    css`
      font-weight: bold;
    `}

  svg {
    width: 1.8rem !important;
    height: 1.8rem !important;

    ${({ isActive }) =>
      !isActive &&
      css`
        opacity: 0.5;
      `}
  }
`;
