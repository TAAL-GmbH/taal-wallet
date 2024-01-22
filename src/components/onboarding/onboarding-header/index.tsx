import type { FC } from 'react';
import styled from 'styled-components';

import { WalletLogo } from '@/components/svg/wallet-logo';
import { Heading } from '@/components/generic/heading';
import { gap, margin } from '@/utils/inject-spacing';
import { ProgressBar } from '@/components/onboarding/progress-bar';

type Props = {
  progress: number;
  heading: string;
};

export const OnboardingHeading: FC<Props> = ({ heading, progress }) => {
  return (
    <Wrapper>
      <WalletLogoStyled />
      <ProgressBar progress={progress} margin="xl 0 0" />
      <Heading level={3} margin="0">
        {heading}
      </Heading>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  ${gap`20px`};
  ${margin`0 0 xxl`};
`;

const WalletLogoStyled = styled(WalletLogo)`
  width: 226px;
`;
