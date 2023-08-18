import { FC } from 'react';
import styled from 'styled-components';

import { margin, padding } from '@/utils/inject-spacing';
import { ShieldCheckIcon } from '@/svg/shield-check-icon';
import { DenyIcon } from '@/svg/deny-icon';
import { Button } from '@/generic/button';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';

export const BackupTips: FC = () => {
  return (
    <>
      <OnboardingHeading heading="Back up your secret phrase" progress={75} />
      <InfoBox color="success">
        <ShieldCheckIcon />
        <div>
          <strong>Keep it safe</strong>
          <Short>Write down your secret phrase and keep it in a safe place</Short>
        </div>
      </InfoBox>
      <InfoBox color="danger">
        <DenyIcon />
        <div>
          <strong>Don’t share it</strong>
          <Short>Never share your secret phrase with anyone or, they will have access to your wallet.</Short>
        </div>
      </InfoBox>

      <ButtonWrapper margin="xxl 0 md">
        <Button variant="transparent" onClick={() => navigateTo(routes.CREATE_ACCOUNT)}>
          Back
        </Button>
        <Button variant="primary" onClick={() => navigateTo(routes.DISPLAY_MNEMONIC)}>
          Proceed
        </Button>
      </ButtonWrapper>
    </>
  );
};

const InfoBox = styled.div<{ color: string }>`
  display: flex;
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  border: 1px solid ${({ theme, color }) => theme.color[color][500]};
  background-color: ${({ theme, color }) => theme.color[color][50]};
  border-radius: 0.4rem;
  margin-top: 1rem;
  ${padding`md`};

  &:hover {
    background-color: ${({ theme, color }) => theme.color[color][100]};
    text-decoration: none;
  }

  strong {
    ${({ theme }) => theme.typography.heading5};
    color: ${({ theme, color }) => theme.color[color][700]};
    display: block;
  }

  svg {
    flex: 0 0 24px;
    width: 24px;
    max-width: unset;
    height: 24px;
    max-height: unset;
    fill: ${({ theme, color }) => theme.color[color][500]};
  }
`;

const Short = styled.div`
  ${({ theme }) => theme.typography.body3};
  color: ${({ theme }) => theme.color.grey[700]};
  ${margin`sm 0 0`};
`;
