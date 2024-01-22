import { FC } from 'react';
import styled from 'styled-components';

import { WalletLogo } from '@/components/svg/wallet-logo';
import { routes } from '@/constants/routes';
import { margin, padding } from '@/utils/inject-spacing';
import { bp } from '@/utils/breakpoints';
import { PlusIcon } from '@/components/svg/plus-icon';
import { KeyIcon } from '@/components/svg/key-icon';
import { Row } from '@/generic/row';

type Props = {
  isInitial?: boolean;
};

// TODO: add back button if it's not initial

export const OnboardingLanding: FC<Props> = ({ isInitial }) => {
  return (
    <Wrapper>
      <WalletLogoStyled />

      {isInitial ? (
        <>
          <HeadingStyled>Welcome to TAAL Wallet</HeadingStyled>
          <Description>Trusted self-custodial Bitcoin Satoshi Vision (BSV) wallet.</Description>
        </>
      ) : (
        <Row $margin="xl 0"> </Row>
      )}

      <Option href={`#${routes.CREATE_ACCOUNT}`}>
        <PlusIcon />
        <div>
          <strong>Create a new wallet</strong>
          <Short>I want to create a new wallet</Short>
        </div>
      </Option>

      <Option href={`#${routes.RECOVER_ACCOUNT_STEP1}`}>
        <KeyIcon />
        <div>
          <strong>Import or recover wallet</strong>
          <Short>I have a secret recovery phrase</Short>
        </div>
      </Option>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;
  ${margin`0 0 xxl`};
`;

const WalletLogoStyled = styled(WalletLogo)`
  ${margin`xxl 0`};
`;

const HeadingStyled = styled.div`
  ${margin`xxl 0 sm`};
  ${({ theme }) => theme.typography.heading3};

  ${bp.mobile`
    ${({ theme }) => theme.typography.heading4};
    ${margin`md 0 sm`};
  `}
`;

const Description = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.color.grey[600]};
  text-align: center;
  ${margin`sm 0 xxl`};
`;

const Option = styled.a`
  display: flex;
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;
  max-width: 350px;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.color.primary[500]};
  background-color: ${({ theme }) => theme.color.primary[50]};
  border-radius: 0.4rem;
  margin-top: 1rem;
  text-align: left;
  ${padding`md`};

  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
    text-decoration: none;
  }

  strong {
    ${({ theme }) => theme.typography.heading5};
    display: block;
  }

  svg {
    flex: 0 0 24px;
    width: 24px;
    max-width: unset;
    height: 24px;
    max-height: unset;
    fill: ${({ theme }) => theme.color.primary[600]};
  }
`;

const Short = styled.div`
  ${({ theme }) => theme.typography.body3};
  color: ${({ theme }) => theme.color.grey[700]};
  ${margin`sm 0 0`};
`;
