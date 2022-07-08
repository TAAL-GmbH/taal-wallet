import { FC } from 'react';
import styled from 'styled-components';
import { OnboardingForm } from '@/src/components/onboarding/onboardingForm';
import { Heading } from '@/src/components/generic/heading';
import { AnchorLink } from '@/src/components/anchorLink';
import { routes } from '@/src/constants/routes';
import { ImportIcon } from '@/src/components/svg/importIcon';
import { BackButton } from '@/src/components/backButton';

type Props = {
  className?: string;
};

export const OnboardingImport: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <BackButton />
      <Heading icon={<ImportIcon />}>Import your Wallet</Heading>
      <div>
        or <AnchorLink href={routes.ONBOARDING_NEW}>create a new one</AnchorLink>
      </div>
      <OnboardingForm action="importExisting" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
