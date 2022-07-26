import { FC, ReactNode } from 'react';
import { routes } from '@/src/constants/routes';
import { lockWallet } from '@/src/features/pkSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks';
import { HomeIcon } from '../../svg/homeIcon';
import { Arrow } from '../../svg/arrow';
import { CogIcon } from '../../svg/cogIcon';
import { WalletPlusIcon } from '../../svg/walletPlusIcon';
import { LockIcon } from '../../svg/lockIcon';
import { HistoryIcon } from '../../svg/historyIcon';
import { TokenIcon } from '../../svg/tokenIcon';
import { useBlockchain } from '@/src/hooks/useBlockchain';
import { FloatingMenuBox } from '../pageHeadStyles';

type Props = {
  className?: string;
};

type MenuItem = {
  action: string | (() => void);
  icon: ReactNode;
};

export const MainMenuList: FC<Props> = ({ className }) => {
  const { isLocked, network } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();
  const { airdrop } = useBlockchain();

  const menuItems: Record<string, MenuItem> = {
    Home: {
      action: routes.HOME,
      icon: <HomeIcon />,
    },
    'Select wallet': { action: routes.PK_LIST, icon: <WalletPlusIcon /> },
    // 'Get Balance': { action: getBalance, icon: <RefreshIcon /> },
    'Send BSV': { action: routes.SEND_BSV, icon: <Arrow /> },
    'Receive BSV': { action: routes.RECEIVE_BSV, icon: <Arrow direction="left" /> },
    History: { action: routes.HISTORY, icon: <HistoryIcon /> },
    Tokens: { action: routes.TOKENS, icon: <TokenIcon /> },
    Options: { action: () => chrome.runtime.openOptionsPage(), icon: <CogIcon /> },
    // WebPush: { action: routes.WEB_PUSH, icon: <RefreshIcon /> },
  };

  if (network?.envName === 'testnet') {
    menuItems['Airdrop'] = { action: () => airdrop(), icon: <Arrow direction="down" /> };
  }

  if (!isLocked) {
    menuItems['Lock wallet'] = { action: () => dispatch(lockWallet()), icon: <LockIcon /> };
  }

  return (
    <FloatingMenuBox className={className}>
      <ul>
        {Object.entries(menuItems).map(([label, { action, icon }]) => {
          return (
            <li key={label}>
              {typeof action === 'string' && (
                <a href={`#${action}`}>
                  {icon}
                  {label}
                </a>
              )}
              {typeof action === 'function' && (
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    action();
                  }}
                >
                  {icon}
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </FloatingMenuBox>
  );
};
