import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { QRCodeSVG } from 'qrcode.react';
import { Note } from '../generic/note';
import { CopyToClipboard } from '../generic/copyToClipboard';
import { InfoIcon } from '../svg/infoIcon';
import { QuickWalletSelector } from '../quickWalletSelector';
import { Arrow } from '../svg/arrow';
import { Heading } from '../generic/heading';
import { BackButton } from '../backButton';
import { CurrentAccount } from '../currentAccount';

export const ReceiveBSV: FC = () => {
  const { activePk } = useAppSelector(state => state.pk);

  return (
    <Wrapper>
      <CurrentAccount />
      <BackButton />
      <Heading icon={<Arrow direction="downleft" />}>Receive BSV</Heading>

      <Subtitle>Your BSV address:</Subtitle>

      <AddressWrapper>
        <CopyToClipboard text={activePk.address} />
        {activePk.address}
      </AddressWrapper>

      <QRCodeWrapper>
        <QRCodeSVG value={activePk.address} />
      </QRCodeWrapper>

      <Note variant="warning" icon={<InfoIcon />} padding="sm md">
        Only works with BSV. Sending other cryptos will result in the loss of funds.
      </Note>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const Subtitle = styled.div`
  font-weight: bold;
  font-size: 1rem;
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm};
`;

const AddressWrapper = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  background-color: ${({ theme }) => theme.color.neutral[100]};
  padding: 0.5rem;
  border-radius: 0.4rem;

  svg {
    color: ${({ theme }) => theme.color.primary[200]};
  }
`;

const QRCodeWrapper = styled.div`
  margin: 1rem 0;
  text-align: center;
`;
