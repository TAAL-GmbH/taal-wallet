import { FC } from 'react';
import styled from 'styled-components';

import { Row } from '@/components/generic/row';
import { gap, margin } from '@/utils/inject-spacing';
import { Chevron } from '@/components/svg/chevron';
import { WalletIcon } from '@/svg/wallet-icon';
import { routes } from '@/constants/routes';
import { EyeOffIcon } from '@/components/svg/eye-off-icon';

export const SelectRecoveryScheme: FC = () => {
  return (
    <Row padding="0 md">
      <Option href={`#${routes.RECOVER_ACCOUNT_DATA_COLLECTION}`}>
        <RecoverOptionCard>
          <IconContainer>
            <WalletIcon />
          </IconContainer>
          <div>
            <RecoverOptionTitle>Standard Security</RecoverOptionTitle>
            <RecoverOptionHint>No passphrase</RecoverOptionHint>
          </div>
        </RecoverOptionCard>
        <div>
          <Chevron direction="right" />
        </div>
      </Option>
      <Hr />
      <Option href={`#${routes.RECOVER_ACCOUNT_DATA_COLLECTION_HIDDEN}`}>
        <RecoverOptionCard>
          <IconContainer>
            <EyeOffIcon />
          </IconContainer>
          <div>
            <RecoverOptionTitle>Passphrase Security</RecoverOptionTitle>
            <RecoverOptionHint>Passphrase is required</RecoverOptionHint>
          </div>
        </RecoverOptionCard>
        <div>
          <Chevron direction="right" />
        </div>
      </Option>
    </Row>
  );
};

const Option = styled.a`
  width: 100%;
  padding: 8px;
  height: 60px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
  }
  display: flex;
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;
  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
    text-decoration: none;
  }
`;

const RecoverOptionCard = styled.div`
  display: flex;
  align-items: center;
  ${gap`md`}
`;

const RecoverOptionTitle = styled.div`
  color: ${({ theme }) => theme.color.grey[800]};
  ${({ theme }) => theme.typography.heading5};
`;

const IconContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.primary[100]};
  justify-items: center;
  display: flex;
  svg {
    width: 20px;
    height: 20px;
    margin: auto;
    max-height: 20px;
    max-width: 20px;
  }
`;

const RecoverOptionHint = styled.div`
  color: ${({ theme }) => theme.color.grey[600]};
  ${({ theme }) => theme.typography.body3};
`;

const Hr = styled.hr`
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[300]};
  ${margin`md 0`};
`;
