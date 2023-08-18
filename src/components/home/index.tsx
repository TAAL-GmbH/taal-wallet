import { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@/hooks';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { useBlockchain } from '@/hooks/use-blockchain';
import { InjectSpacing } from '@/types';
import { bp } from '@/utils/breakpoints';
import { truncateText } from '@/utils/text-utils';
import { Button } from '@/generic/button';
import { IconButton } from '@/generic/icon-button';
import { RefreshIcon } from '@/components/svg/refresh-icon';
import { BsvIcon } from '@/components/svg/bsv-icon';
import { Tooltip } from '@/generic/tooltip';
import { Layout } from '@/components/layout/default-layout';
import { CopyToClipboard } from '@/components/generic/copy-to-clipboard';
import { gap, injectSpacing, margin } from '@/utils/inject-spacing';
import { ConnectionStatus } from '@/components/connection-status';
import { WalletSelector } from '@/components/wallet-selector';
import { Debug } from '@/components/debug/debug';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { DownloadIcon } from '@/svg/download-icon';
import { SendIcon } from '@/svg/send-icon';
import { Amount } from '@/components/amount';

export const Home: FC = () => {
  const balanceWasFetched = useRef(false);
  const { activePk } = useAppSelector(state => state.pk);
  const { getBalance } = useBlockchain();

  useEffect(() => {
    if (balanceWasFetched.current) {
      return;
    }
    getBalance({ showToast: false });
    balanceWasFetched.current = true;
  }, [getBalance, balanceWasFetched]);

  const header = (
    <>
      <ConnectionStatus />
      <span />
      <WalletSelector />
    </>
  );

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Layout center header={header}>
      <BsvIconStyled />

      <Balance>
        <AmountStyled sats={activePk?.balance?.satoshis} />
        <Tooltip contents="Refresh balance">
          <IconButton onClick={getBalance} data-tip="Refetch balance">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Balance>

      <Address $margin="md 0 xxl">
        {/* {truncateText(activePk?.address, 8, 8)} <CopyToClipboard textToCopy={activePk?.address} /> */}
        {activePk?.address} <CopyToClipboard textToCopy={activePk?.address} />
      </Address>

      <ButtonWrapper>
        <Button variant="primary" onClick={() => navigateTo(routes.RECEIVE_BSV)}>
          <DownloadIcon />
          Receive
        </Button>
        <Button variant="primary" onClick={() => navigateTo(routes.SEND_BSV)}>
          <SendIcon />
          Send
        </Button>
      </ButtonWrapper>

      {isDev && <Debug />}
    </Layout>
  );
};

const BsvIconStyled = styled(BsvIcon)`
  width: 48px;
  height: 48px;
  ${margin`xxxl 0 sm`};

  ${bp.mobile`
    ${margin`md 0 sm`};
  `};
`;

const Balance = styled.div<InjectSpacing>`
  display: flex;
  align-items: center;
  ${margin`sm 0`};
  ${gap`sm`};
`;

const AmountStyled = styled(Amount)`
  ${({ theme }) => theme.typography.heading2};
`;

const Address = styled.div<InjectSpacing>`
  display: flex;
  gap: 0.25rem;
  color: ${({ theme }) => theme.color.secondary[600]};
  white-space: nowrap;
  ${({ theme }) => theme.typography.body3};
  ${injectSpacing(['margin'])};

  svg {
    fill: ${({ theme }) => theme.color.secondary[600]};
  }
`;
