import { FC } from 'react';
import { routes } from '@/src/constants/routes';
import { FloatingMenuBox } from '../pageHeadStyles';
import { AccountList } from './accountList';
import { WalletPlusIcon } from '../../svg/walletPlusIcon';
import { ImportIcon } from '../../svg/importIcon';

type Props = {
  className?: string;
};

export const AccountMenuContents: FC<Props> = ({ className }) => {
  return (
    <FloatingMenuBox className={className}>
      <AccountList />
      <hr />
      <ul>
        <li>
          <a href={`#${routes.ONBOARDING_NEW}`}>
            <WalletPlusIcon />
            Add new account
          </a>
        </li>
        <li>
          <a href={`#${routes.ONBOARDING_IMPORT}`}>
            <ImportIcon />
            Import account
          </a>
        </li>
      </ul>
    </FloatingMenuBox>
  );
};
