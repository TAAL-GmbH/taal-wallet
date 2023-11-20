import { FC, useRef, useState } from 'react';
import { styled } from 'styled-components';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { isBackgroundPageResponding } from '@/utils/communication';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { db } from '@/db';
import { waitForTruthy } from '@/utils/wait-for-truthy';
import { sharedDb } from '@/db/shared';
import { store } from '@/store';
import { AccountType } from '@/types';
import { useModal } from '@/hooks/use-modal';
import { updateAccountName } from '@/features/account-slice';
import { RenameForm } from '@/components/rename-form';
import { MinimalLayout } from '@/components/layout/minimal-layout';
import { IconButton } from '@/generic/icon-button';
import { Ul } from '@/generic/list/ul';
import { PlusIcon } from '@/svg/plus-icon';

import { AccountListItem } from './list-item';

export const AccountList: FC = () => {
  const [currentAccountName, setCurrentAccountName] = useState('');
  const accountIdToEdit = useRef('');
  const account = useAppSelector(state => state.account);
  const { isLocked } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();
  const { RenderModal, show, close } = useModal();

  const selectAccount = async (accountId: string, isActive: boolean) => {
    if (isActive) {
      history.back();
      return;
    }

    if (!(await isBackgroundPageResponding())) {
      console.error('Background page is not responding');
      return navigateTo(routes.ERROR);
    }

    await db.useAccount(accountId);

    const isAccountWrittenToDb = await waitForTruthy(
      async () => (await sharedDb.getKeyVal('activeAccountId')) === accountId
    );
    if (!isAccountWrittenToDb) {
      toast.error('Failed to write account to db');
      return;
    }

    const isAccountSetInState = await waitForTruthy(
      () => store.getState().account.activeAccountId === accountId
    );

    if (!isAccountSetInState) {
      toast.error('Failed to set account in state');
      return;
    }

    toast.success('Account changed');
    history.back();
  };

  const onEditClick = (account: AccountType, e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentAccountName(account.name);
    accountIdToEdit.current = account.id;
    show();
  };

  const updateName = (accountName: string) => {
    if (isLocked) {
      toast.error('Wallet is locked');
      return;
    }
    dispatch(updateAccountName({ accountId: accountIdToEdit.current, accountName }));
    close();
  };

  const isUniqueFn = (name: string) => {
    return !account.accountList.find(item => item.name === name)
      ? true
      : 'Account with this name already exists';
  };

  const accountList = [...account.accountList].sort((a, b) => a.name.toLowerCase().localeCompare(b.name));

  const header = (
    <>
      <span>My accounts</span>
      <IconButtonStyled onClick={() => navigateTo(routes.ONBOARDING)}>
        <PlusIcon />
      </IconButtonStyled>
    </>
  );

  return (
    <>
      <RenderModal title="Edit account" onClose={close}>
        <RenameForm
          onSubmit={updateName}
          onClose={close}
          currentValue={currentAccountName}
          isUniqueFn={isUniqueFn}
        />
      </RenderModal>
      <MinimalLayout header={header}>
        <Ul>
          {accountList
            .filter(item => item.networkId === 'mainnet')
            .map(item => (
              <AccountListItem
                key={item.id}
                account={item}
                activeAccountId={account.activeAccountId}
                onClick={selectAccount}
                onEditClick={onEditClick}
              />
            ))}
          {accountList
            .filter(item => item.networkId === 'testnet')
            .map(item => (
              <AccountListItem
                key={item.id}
                account={item}
                activeAccountId={account.activeAccountId}
                onClick={selectAccount}
                onEditClick={onEditClick}
              />
            ))}
        </Ul>
      </MinimalLayout>
    </>
  );
};

const IconButtonStyled = styled(IconButton)`
  width: 24px;
  color: ${({ theme }) => theme.color.primary[600]};
`;
