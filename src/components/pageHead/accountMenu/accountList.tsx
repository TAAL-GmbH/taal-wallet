import { FC } from 'react';
import toast from 'react-hot-toast';
import { db } from '@/src/db';
import { setActiveAccountId } from '@/src/features/accountSlice';
import { useAppSelector } from '@/src/hooks';
import { AccountListItem } from './accountListItem';
import { isBackgroundPageResponding } from '@/src/utils/communication';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { dispatchAndValidate } from '@/src/utils/dispatchAndValidate';

type Props = {
  className?: string;
};

export const AccountList: FC<Props> = ({ className }) => {
  const { accountList } = useAppSelector(state => state.account);

  const onClick = async (accountId: string) => {
    if (!(await isBackgroundPageResponding())) {
      return navigateTo(routes.ERROR);
    }

    await db.useAccount(accountId);
    await dispatchAndValidate(setActiveAccountId(accountId), s => s.account.activeAccountId === accountId);
    await chrome.runtime.sendMessage({ action: 'bg:reloadFromDb' });
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
