import { FC } from 'react';
import styled from 'styled-components';
import { OnboardingForm } from '@/src/components/onboarding/onboardingForm';
import { Heading } from '@/src/components/generic/heading';
import { AnchorLink } from '@/src/components/anchorLink';
import { routes } from '@/src/constants/routes';
import { BackButton } from '@/src/components/backButton';
import { WalletPlusIcon } from '@/src/components/svg/walletPlusIcon';

type Props = {
  className?: string;
};

export const OnboardingNew: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <BackButton />
      <Heading icon={<WalletPlusIcon />}>Create a new wallet</Heading>
      <div>
        or <AnchorLink href={routes.ONBOARDING_IMPORT}>import existing one</AnchorLink>
      </div>
      <OnboardingForm action="createNew" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
