import { FC } from 'react';
import styled from 'styled-components';
import { OnboardingForm } from '@/src/components/onboarding/onboardingForm';

type Props = {
  className?: string;
};

export const OnboardingNew: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <h1>Create a new Wallet</h1>
      <OnboardingForm action="createNew" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
