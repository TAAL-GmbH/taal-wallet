import { FC, useEffect } from 'react';
import { useAppSelector } from '@/src/hooks';
import { AnchorLink } from '../anchorLink';
import { formatNumber, isNull } from '@/src/utils/generic';
import { createToast } from '@/src/utils/toast';
import { getBalance } from '@/src/features/wocApiSlice';
import { Dl } from '../generic/styled';
import styled from 'styled-components';
import { IconButton } from '../generic/icon-button';
import { CloseIcon } from '../svg/closeIcon';
import dayjs from 'dayjs';
import { CopyToClipboard } from '../generic/copyToClipboard';
import { Button } from '../button';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { WalletPlusIcon } from '../svg/walletPlusIcon';

type Props = {
  onClose: () => void;
};

export const CurrentWallet: FC<Props> = ({ onClose }) => {
  const { activePk } = useAppSelector(state => state.pk);

  useEffect(() => {
    if (activePk?.address && typeof activePk?.balance?.amount !== 'number') {
      _getBalance();
    }
  }, [activePk?.balance?.amount]);

  const balance =
    typeof activePk?.balance?.amount === 'number'
      ? `${formatNumber(activePk?.balance?.amount)} satoshis`
      : 'unknown';

  const _getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!activePk?.address) {
      toast.error('Please select an address');
      return;
    }
    const result = await getBalance([activePk.address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
    }
  };

  return (
    <>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <Dl padding="0" margin="xs 0">
        <dt>Name:</dt>
        <dd>{activePk?.name}</dd>

        <dt>Path:</dt>
        <dd>{activePk?.path}</dd>

        <dt>Address:</dt>
        <dd>
          <CopyToClipboard text={activePk.address} showText />
        </dd>

        <dt>Balance:</dt>
        <dd>
          {balance} (
          <AnchorLink href="#" onClick={_getBalance}>
            refresh
          </AnchorLink>
          )
        </dd>
        {activePk.balance?.updatedAt && (
          <>
            <dt>Updated at:</dt>
            <dd>{dayjs(activePk.balance.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</dd>
          </>
        )}
      </Dl>
      <ButtonStyled onClick={() => navigateTo(routes.PK_LIST)} margin="xs 0">
        <WalletPlusIcon />
        Select another wallet
      </ButtonStyled>
    </>
  );
};

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.5rem;
  right: 0.2rem;

  svg {
    width: 1.1rem;
  }
`;
const ButtonStyled = styled(Button)`
  width: 100%;
`;
