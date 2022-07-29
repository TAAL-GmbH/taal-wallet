import { FC } from 'react';
import toast from 'react-hot-toast';
import { db } from '@/src/db';
import { useAppSelector } from '@/src/hooks';
import { AccountListItem } from './accountListItem';
import { isBackgroundPageResponding } from '@/src/utils/communication';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { waitForTruthy } from '@/src/utils/waitForTruthy';
import { sharedDb } from '@/src/db/shared';
import { store } from '@/src/store';

type Props = {
  className?: string;
};

export const AccountList: FC<Props> = ({ className }) => {
  const { accountList } = useAppSelector(state => state.account);

  const onClick = async (accountId: string) => {
    if (!(await isBackgroundPageResponding())) {
      console.error('Background page is not responding');
      return navigateTo(routes.ERROR);
    }

    await db.useAccount(accountId);

    await chrome.runtime.sendMessage({ action: 'bg:reloadFromDb' });

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
  };

  return (
    <ul className={className}>
      {accountList.map(account => (
        <AccountListItem account={account} key={account.id} onClick={onClick} />
      ))}
    </ul>
  );
};
