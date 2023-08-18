import { FC } from 'react';
import styled, { css } from 'styled-components';

import { AccountType } from '@/types';
import { CheckIcon } from '@/components/svg/check-icon';
import { AccountIcon } from '@/components/account-icon';
import { gap, padding } from '@/utils/inject-spacing';
import { EditIcon } from '@/components/svg/edit-icon';
import { Li } from '@/generic/list/li';

type Props = {
  account: AccountType;
  activeAccountId: string;
  onClick: (accountId: string, isActive: boolean) => void;
  onEditClick: (account: AccountType, e: React.MouseEvent<HTMLSpanElement>) => void;
};

export const AccountListItem: FC<Props> = ({ account, activeAccountId, onClick, onEditClick }) => {
  const isActive = account.id === activeAccountId;
  return (
    <Li role="button" key={account.id} onClick={() => onClick(account.id, isActive)} $isActive={isActive}>
      <AccountIcon accountId={account.id} />
      <Details>
        <Name>{account.name}</Name>
        <Info>{account.networkId}</Info>
      </Details>

      <RightWrapper>
        {isActive && (
          <>
            <CheckIconStyled />
            <EditButton role="button" onClick={e => onEditClick(account, e)}>
              <EditIcon />
            </EditButton>
          </>
        )}
      </RightWrapper>
    </Li>
  );
};

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  color: ${({ theme }) => theme.color.primary[600]};
  ${({ theme }) => theme.typography.heading6};
`;
const Info = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.color.grey[800]};
  ${({ theme }) => theme.typography.body4};
`;

const EditButton = styled.span`
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  ${padding`1px 2px`};

  &:hover {
    background-color: ${({ theme }) => theme.color.primary[200]};
  }
`;

const CheckIconStyled = styled(CheckIcon)`
  width: 20px;
`;

const RightWrapper = styled.div`
  display: flex;
  color: ${({ theme }) => theme.color.primary[600]};
  ${gap`xs`};

  svg {
    width: 20px;
  }
`;
