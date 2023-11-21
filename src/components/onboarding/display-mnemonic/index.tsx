import { FC, useEffect } from 'react';
import styled from 'styled-components';
import { generateMnemonic } from '@/utils/blockchain';
import { gap, margin, padding } from '@/utils/inject-spacing';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { CopyToClipboard } from '@/generic/copy-to-clipboard';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { Button } from '@/generic/button';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';
import { CopyIcon } from '@/components/svg/copy-icon';

type Props = {
  mnemonicPhrase: string;
  setMnemonicPhrase: (mnemonic: string) => void;
};

export const DisplayMnemonic: FC<Props> = ({ mnemonicPhrase, setMnemonicPhrase }) => {
  useEffect(() => {
    if (!mnemonicPhrase) {
      setMnemonicPhrase(generateMnemonic().phrase);
    }
  }, [mnemonicPhrase]);

  return (
    <>
      <OnboardingHeading heading={'Your secret phrase'} progress={100} />

      <MnemonicPhrase>{mnemonicPhrase}</MnemonicPhrase>
      <CopyToClipboardStyled textToCopy={mnemonicPhrase}>
        <CopyIcon /> Copy to clipboard
      </CopyToClipboardStyled>

      <ButtonWrapper margin="xxl 0 md">
        <Button variant="transparent" onClick={() => navigateTo(routes.CREATE_ACCOUNT)}>
          Back
        </Button>
        <Button variant="primary" onClick={() => navigateTo(routes.VALIDATE_AND_CREATE)}>
          Proceed
        </Button>
      </ButtonWrapper>
    </>
  );
};

const MnemonicPhrase = styled.div`
  ${({ theme }) => theme.typography.body2};
  line-height: 24px;
  ${padding`sm md md`};
  ${margin`md 0 xs`};
  border: 1px solid ${({ theme }) => theme.color.grey[300]};
  border-radius: 0.4rem;
  word-break: break-all;
`;

const CopyToClipboardStyled = styled(CopyToClipboard)`
  align-self: flex-start;
  ${({ theme }) => theme.typography.heading7};
  ${margin`xs sm xl`};

  > div {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.color.secondary[500]};
    ${gap`xs`};
  }
`;
