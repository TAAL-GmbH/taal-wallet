import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';

import { useAppSelector } from '@/hooks';

import { Note } from '@/generic/note';
import { CopyToClipboard } from '@/components/generic/copy-to-clipboard';
import { InfoIcon } from '@/components/svg/info-icon';
import { MinimalLayout } from '@/components/layout/minimal-layout';
import { margin, padding } from '@/utils/inject-spacing';

export const ReceiveBSV: FC = () => {
  const { activePk } = useAppSelector(state => state.pk);
  const theme = useTheme();

  const header = (
    <span>
      Use the QR code to add
      <br />
      BSV tokens to your wallet
    </span>
  );

  return (
    <MinimalLayout header={header}>
      <QRCodeWrapper>
        <QRCodeSVG value={activePk.address} fgColor={theme.color.primary[600]} />
      </QRCodeWrapper>

      <AddressWrapper>
        <Address>{activePk.address}</Address>
        <CopyToClipboard textToCopy={activePk.address} />
      </AddressWrapper>

      <Note variant="default" icon={<InfoIcon />} padding="sm md">
        Only send BSV to this address
      </Note>
    </MinimalLayout>
  );
};

const AddressWrapper = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.grey[50]};
  color: ${({ theme }) => theme.color.primary[600]};
  border-radius: 0.4rem;
  ${({ theme }) => theme.typography.heading7};
  ${margin`xl 0 md`};
  ${padding`md sm`};

  svg {
    color: ${({ theme }) => theme.color.primary[600]};
  }
`;

const Address = styled.div`
  overflow-wrap: break-word;
  max-width: 300px;
`;

const QRCodeWrapper = styled.div`
  text-align: center;
  ${margin`xxxl 0 md`};

  svg {
    fill: ${({ theme }) => theme.color.primary[600]} !important;
  }
`;
