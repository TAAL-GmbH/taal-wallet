import { db } from '@/src/db';
import { setActiveAccountId } from '@/src/features/accountSlice';
import { useAppSelector } from '@/src/hooks';
import { store } from '@/src/store';
import { FC } from 'react';
import toast from 'react-hot-toast';
import { AccountListItem } from './accountListItem';

type Props = {
  className?: string;
};

export const AccountList: FC<Props> = ({ className }) => {
  const { accountList } = useAppSelector(state => state.account);

  const onClick = async (accountId: string) => {
    // TODO: check if background is responding
    await db.useAccount(accountId);
    store.dispatch(setActiveAccountId(accountId));
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
