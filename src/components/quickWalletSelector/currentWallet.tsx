import { FC, useEffect } from 'react';
import { useAppSelector } from '@/src/hooks';
import styled from 'styled-components';
import { IconButton } from '../generic/icon-button';
import { CloseIcon } from '../svg/closeIcon';
import { Button } from '../button';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { WalletPlusIcon } from '../svg/walletPlusIcon';
import { WalletDetails } from '../walletDetails';
import { getBalance } from '@/src/features/wocApi';

type Props = {
  onClose: () => void;
};

export const CurrentWallet: FC<Props> = ({ onClose }) => {
  const { activePk } = useAppSelector(state => state.pk);

  useEffect(() => {
    if (activePk?.address && typeof activePk?.balance?.satoshis !== 'number') {
      getBalance([activePk.address]);
    }
  }, [activePk?.balance?.satoshis]);

  return (
    <>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>

      <WalletDetails data={activePk} />

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
