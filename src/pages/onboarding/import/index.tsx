import { FC } from 'react';
import styled from 'styled-components';
import { OnboardingForm } from '@/src/components/onboarding/onboardingForm';

type Props = {
  className?: string;
};

export const OnboardingImport: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <h1>Import your Wallet</h1>
      <OnboardingForm action="importExisting" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
