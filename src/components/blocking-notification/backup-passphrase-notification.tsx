import { FC } from 'react';
import styled from 'styled-components';

import { Note } from '@/generic/note';
import { ShieldCheckIcon } from '@/svg/shield-check-icon';
import { Heading } from '@/generic/heading';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { Button } from '@/generic/button';
import { SpaceGrabber } from '@/generic/styled';
import { WalletLogo } from '@/svg/wallet-logo';
import { margin } from '@/utils/inject-spacing';
import { db } from '@/db/index';

export const BackupPassphraseNotification: FC = () => {
  const markAndContinue = async () => {
    await db.setKeyVal('isNotified.toBackupPassphrase', true);
    window.location.reload();
  };

  return (
    <Wrapper>
      <WalletLogoStyled />
      <NoteStyled variant="success" icon={<ShieldCheckIcon />}>
        <Body>
          <Heading level={5} margin="2px 0 sm">
            Keep your account secure
          </Heading>
          <p>
            This account is currently protected with an additional security layer (passphrase). The passphrase
            is identical to the password you use to log in to your account.
          </p>

          <p>
            If you haven’t already, we strongly recommend you write down your passphrase and keep it safe.
            You’ll need it, along with your seed phrase, to recover your wallet.
          </p>
        </Body>
      </NoteStyled>

      <SpaceGrabber />

      <ButtonWrapper>
        <Button variant="primary" onClick={markAndContinue}>
          I’ve written it down
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
`;

const WalletLogoStyled = styled(WalletLogo)`
  width: 226px;
  ${margin`lg 0 xl`};
`;

const NoteStyled = styled(Note)`
  align-items: start;
`;

const Body = styled.div`
  p {
    ${({ theme }) => theme.typography.body3};
    color: ${({ theme }) => theme.color.grey[800]};
  }
`;
