import { FC, ReactNode } from 'react';
import { styled } from 'styled-components';

import { routes } from '@/constants/routes';
import { lockWallet } from '@/features/pk-slice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useBlockchain } from '@/hooks/use-blockchain';
import { HomeIcon } from '@/svg/home-icon';
import { LockIcon } from '@/components/svg/lock-icon';
import { gap, margin, padding } from '@/utils/inject-spacing';
import { ExpandIcon } from '@/svg/expand-icon';
import { isPopup } from '@/utils/generic';
import { AirdropIcon } from '@/svg/airdrop-icon';
import { DiscordIcon } from '@/svg/discord-icon';
import { TransmitIcon } from '@/svg/transmit-icon';
import { TargetBlankIcon } from '@/svg/target-blank-icon';

type Props = {
  onClick?: () => void;
};

type MenuItem = {
  title: string;
  action: string | (() => void);
  icon: ReactNode;
};

export const MenuBox: FC<Props> = ({ onClick }) => {
  const { isLocked, network, activePk } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();
  const { airdrop } = useBlockchain();

  const getExplorerUrl = () => {
    if (!activePk.address) return '';
    return network.id === 'mainnet'
      ? `https://whatsonchain.com/address/${activePk.address}`
      : `https://test.whatsonchain.com/address/${activePk.address}`;
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Home',
      action: routes.HOME,
      icon: <HomeIcon />,
    },
    // 'Select wallet': { action: routes.PK_LIST, icon: <WalletPlusIcon /> },
    // 'Get Balance': { action: getBalance, icon: <RefreshIcon /> },
    // 'Send BSV': { action: routes.SEND_BSV, icon: <Arrow /> },
    // 'Receive BSV': { action: routes.RECEIVE_BSV, icon: <Arrow direction="left" /> },
    // History: { action: routes.HISTORY, icon: <HistoryIcon /> },
    // Tokens: { action: routes.TOKENS, icon: <TokenIcon /> },
    { title: 'Connected sites', action: () => chrome.runtime.openOptionsPage(), icon: <TransmitIcon /> },
    { title: 'View address in explorer', action: getExplorerUrl(), icon: <TargetBlankIcon /> },
    // WebPush: { action: routes.WEB_PUSH, icon: <RefreshIcon /> },
  ];

  if (isPopup()) {
    menuItems.unshift({
      title: 'Expanded view',
      action: () => chrome.tabs.create({ url: window.location.href }),
      icon: <ExpandIcon />,
    });
  }

  if (network?.envName === 'testnet') {
    menuItems.push({ title: 'Airdrop', action: airdrop, icon: <AirdropIcon /> });
  }

  if (!isLocked) {
    menuItems.push({ title: 'Lock wallet', action: () => dispatch(lockWallet()), icon: <LockIcon /> });
  }

  return (
    <Wrapper>
      <ul>
        {menuItems.map(({ title, action, icon }) => {
          return (
            <li key={title}>
              {typeof action === 'string' && (
                <A
                  href={action.startsWith('http') ? action : `#${action}`}
                  target={action.startsWith('http') ? '_blank' : '_self'}
                >
                  {icon}
                  {title}
                </A>
              )}
              {typeof action === 'function' && (
                <A
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    action();
                    onClick?.();
                  }}
                >
                  {icon}
                  {title}
                </A>
              )}
            </li>
          );
        })}
      </ul>

      <Hr />

      <HelpHeader>Need help or support?</HelpHeader>
      <ul>
        <li>
          <A href="#">
            <DiscordIcon /> Discord
          </A>
        </li>
      </ul>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.constant.topNavBarHeight};
  right: 0;
  bottom: 0;
  overflow-y: auto;
  background-color: #fff;
  min-width: 285px;
  z-index: 100;
  ${padding`sm md`}

  ul {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    white-space: nowrap;
    ${margin`0 0 sm`};
    ${gap`sm`};
  }
`;

const A = styled.a`
  display: flex;
  align-items: center;
  height: 32px;
  box-sizing: border-box;
  ${({ theme }) => theme.typography.heading6};
  color: ${({ theme }) => theme.color.primary[600]};
  ${gap`sm`}
  ${padding`0 md`}

  &:hover {
    background-color: ${({ theme }) => theme.color.grey[100]};
    text-decoration: none;
  }

  svg {
    width: 18px;
    height: 18px;
    max-width: unset;
    max-height: unset;
    margin: 0;
  }
`;

const Hr = styled.hr`
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[300]};
  ${margin`xl 0`};
`;

const HelpHeader = styled.div`
  ${({ theme }) => theme.typography.body3};
  color: ${({ theme }) => theme.color.grey[600]};
  ${margin`0 0 lg`};
`;
