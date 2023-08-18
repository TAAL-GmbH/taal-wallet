import { FC, MouseEvent, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { gap, padding } from '@/utils/inject-spacing';
import { formatAddress } from '@/utils/generic';
import { setActivePk, updateWalletName } from '@/features/pk-slice';
import { PKType } from '@/types';
import { useModal } from '@/hooks/use-modal';
import { MinimalLayout } from '@/components/layout/minimal-layout';
import { WalletIcon } from '@/svg/wallet-icon';
import { Amount } from '@/components/amount';
import { PlusIcon } from '@/svg/plus-icon';
import { CheckIcon } from '@/components/svg/check-icon';
import { EditIcon } from '@/components/svg/edit-icon';
import { RenameForm } from '@/components/rename-form';
import { DerivePk } from '@/components/derive-pk';
import { IconButton } from '@/generic/icon-button';
import { Ul } from '@/generic/list/ul';
import { Li } from '@/generic/list/li';

export const WalletList: FC = () => {
  const addrToEdit = useRef('');
  const [currentWalletName, setCurrentWalletName] = useState('');
  const pk = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();
  const renameModal = useModal();
  const createWalletModal = useModal();

  const selectWallet = (address: string) => {
    if (pk.activePk.address !== address) {
      dispatch(setActivePk(address));
    }
    history.back();
  };

  const showEditModal = (item: PKType, e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    addrToEdit.current = item.address;
    setCurrentWalletName(item.name);
    renameModal.show();
  };

  const updateName = (name: string) => {
    if (name !== currentWalletName) {
      dispatch(updateWalletName({ address: addrToEdit.current, walletName: name }));
    }
    renameModal.close();
  };

  const walletList = Object.values(pk.map).sort((a, b) => a.name.localeCompare(b.name));

  const header = (
    <>
      <span>My wallets</span>
      <IconButtonStyled onClick={createWalletModal.show}>
        <PlusIcon />
      </IconButtonStyled>
    </>
  );
  return (
    <>
      <renameModal.RenderModal title="Edit wallet" onClose={renameModal.close}>
        <RenameForm onSubmit={updateName} onClose={renameModal.close} value={currentWalletName} />
      </renameModal.RenderModal>

      <createWalletModal.RenderModal title="Create a new wallet" onClose={close}>
        <DerivePk onClose={createWalletModal.close} />
      </createWalletModal.RenderModal>

      <MinimalLayout header={header}>
        <Ul>
          {walletList.map(item => {
            const isActive = pk.activePk.address === item.address;
            return (
              <LiStyled
                role="button"
                key={item.address}
                onClick={() => selectWallet(item.address)}
                $isActive={isActive}
              >
                <WalletIcon />
                <Details>
                  <Name>{item.name}</Name>
                  <Info>
                    {formatAddress(item.address)},{' '}
                    <span>
                      <Amount sats={item.balance.satoshis} />
                    </span>
                  </Info>
                </Details>
                <RightWrapper>
                  {pk.activePk.address === item.address && <CheckIcon />}
                  <EditButton role="button" onClick={e => showEditModal(item, e)}>
                    <EditIcon />
                  </EditButton>
                </RightWrapper>
              </LiStyled>
            );
          })}
        </Ul>
      </MinimalLayout>
    </>
  );
};

const RightWrapper = styled.div`
  display: flex;
  color: ${({ theme }) => theme.color.primary[600]};
  ${gap`xs`};

  svg {
    width: 20px;
  }
`;

const EditButton = styled.span`
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  ${padding`1px 2px`};
  display: none;

  &:hover {
    background-color: ${({ theme }) => theme.color.grey[200]};
  }
`;

const IconButtonStyled = styled(IconButton)`
  width: 24px;
  color: ${({ theme }) => theme.color.primary[600]};
`;

const LiStyled = styled(Li)`
  &:hover {
    ${EditButton} {
      display: block;
    }
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  color: ${({ theme }) => theme.color.primary[600]};
  ${({ theme }) => theme.typography.heading6};
`;
const Info = styled.div`
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.color.grey[800]};
  ${({ theme }) => theme.typography.body4};
  ${gap`sm`};
`;
