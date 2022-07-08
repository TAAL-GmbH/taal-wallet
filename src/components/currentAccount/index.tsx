import { useAppSelector } from '@/src/hooks';
import { FC } from 'react';
import styled from 'styled-components';
import { NetworkPill } from '../networkPill';
import { AccountIcon } from '../svg/accountIcon';
import { AccountNameForm } from './accountNameForm';

type Props = {
  className?: string;
};

export const CurrentAccount: FC<Props> = ({ className }) => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);
  const currentAccount = accountMap[activeAccountId];

  return (
    <Wrapper className={className}>
      <AccountIconBox>
        <AccountIcon />
        <NetworkPill>{accountMap[activeAccountId]?.networkId}</NetworkPill>
      </AccountIconBox>
      <AccountNameWrapper>
        <Label>Current account: </Label>
        {currentAccount && <AccountNameForm key={currentAccount.id} account={currentAccount} />}
      </AccountNameWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.2rem 0.8rem;
  margin: 0 0 1rem;
  border: 1px solid ${({ theme }) => theme.color.neutral[500]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.color.neutral[100]};
`;

const AccountIconBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 2rem;
    height: 2rem;
    margin: 0.2rem 0.2rem 0.5rem;
  }

  span {
    position: absolute;
    top: 1.5rem;
  }
`;

const Label = styled.div`
  font-size: 0.8rem;
`;

const AccountNameWrapper = styled.div`
  margin-top: 0.2rem;
`;
