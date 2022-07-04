import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';
import { store } from '@/src/store';
import { lockWallet } from '@/src/features/pkSlice';
import { useAppSelector } from '@/src/hooks';
import { HomeIcon } from '../svg/homeIcon';
import { Arrow } from '../svg/arrow';
import { CogIcon } from '../svg/cogIcon';
import { WalletPlusIcon } from '../svg/walletPlusIcon';
import { RefreshIcon } from '../svg/refreshIcon';
import { LockIcon } from '../svg/lockIcon';
import { HistoryIcon } from '../svg/historyIcon';
import { TokenIcon } from '../svg/tokenIcon';
import { useBlockchain } from '@/src/hooks/useBlockchain';

type Props = {
  className?: string;
};

type MenuItem = {
  action: string | (() => void);
  icon: ReactNode;
};

export const TopMenu: FC<Props> = ({ className }) => {
  const { isLocked, network } = useAppSelector(state => state.pk);
  const { getBalance, airdrop } = useBlockchain();

  const menuItems: Record<string, MenuItem> = {
    Home: {
      action: routes.HOME,
      icon: <HomeIcon />,
    },
    'Select Wallet': { action: routes.PK_LIST, icon: <WalletPlusIcon /> },
    'Get Balance': { action: getBalance, icon: <RefreshIcon /> },
    'Send BSV': { action: routes.SEND_BSV, icon: <Arrow /> },
    'Receive BSV': { action: routes.RECEIVE_BSV, icon: <Arrow direction="left" /> },
    History: { action: routes.HISTORY, icon: <HistoryIcon /> },
    Tokens: { action: routes.TOKENS, icon: <TokenIcon /> },
    Options: { action: () => chrome.runtime.openOptionsPage(), icon: <CogIcon /> },
    WebPush: { action: routes.WEB_PUSH, icon: <RefreshIcon /> },
  };

  if (network?.envName === 'testnet') {
    menuItems['Airdrop'] = { action: () => airdrop(), icon: <Arrow direction="down" /> };
  }

  if (!isLocked) {
    menuItems['Lock Wallet'] = { action: () => store.dispatch(lockWallet()), icon: <LockIcon /> };
  }

  return (
    <Wrapper className={className}>
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
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 0.2rem 0;
  background-color: #fff;
  border-radius: 0.4rem;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
  text-align: left;
  min-width: 150px;
  z-index: 1000;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: ${({ theme }) => theme.color.grey[700]};
    white-space: nowrap;
    padding: 0.5rem 2rem 0.5rem 1.5rem;
    font-size: 0.85rem;

    svg {
      max-width: 1.2rem;
      max-height: 1.2rem;
      margin: 0;
      fill: ${({ theme }) => theme.color.grey[600]};
    }

    &:hover {
      color: ${({ theme }) => theme.color.grey[900]};
      background-color: ${({ theme }) => theme.color.grey[100]};
    }
  }
`;
