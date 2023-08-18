import { FC } from 'react';
import styled, { css } from 'styled-components';

import { bp } from '@/utils/breakpoints';
import { routes } from '@/constants/routes';
import { HomeIcon } from '@/svg/home-icon';
import { TokensIcon } from '@/svg/tokens-icon';
import { SparklesIcon } from '@/svg/sparkles-icon';
import { HistoryIcon } from '@/svg/history-icon';
import { getLocationPath } from '@/utils/navigation';

type Props = {
  className?: string;
};

const menuList = [
  {
    name: 'Home',
    route: routes.HOME,
    icon: <HomeIcon />,
  },
  {
    name: 'Tokens',
    route: routes.TOKENS,
    icon: <TokensIcon />,
  },
  {
    name: 'NFT',
    route: routes.NFT,
    icon: <SparklesIcon />,
  },
  {
    name: 'History',
    route: routes.HISTORY,
    icon: <HistoryIcon />,
  },
];

export const NavBar: FC<Props> = ({ className }) => {
  const $isActive = (route: string) => getLocationPath() === route;

  return (
    <Wrapper className={className}>
      {menuList.map(({ name, route, icon }) => (
        <NavItem key={name} href={`#${route}`} $isActive={$isActive(route)}>
          {icon}
          {name}
        </NavItem>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.nav`
  grid-area: navbar;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.grid.gap};
  padding: ${({ theme }) => theme.spacing.sm};
  align-self: flex-start;
  justify-self: center;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background-color: white;
  color: ${({ theme }) => theme.color.primary[600]};
  margin-left: 16px;
  z-index: 50;
  position: sticky;
  top: calc(${({ theme }) => theme.constant.topNavBarHeight} + ${({ theme }) => theme.spacing.md});

  ${({ theme }) =>
    bp.mobile`
    flex-direction: row;
    justify-content: space-around;
    position: fixed;
    top: unset;
    right: ${({ theme }) => theme.spacing.sm};
    bottom: 8px;
    left: 8px;
    margin: 0;
    min-width: calc(${theme.constant.bodyMinWidth} - ${theme.spacing.md} - ${theme.spacing.md});
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.08), 0px 5px 5px 10px rgba(255, 255, 255, 0.9);
  `};
`;

const NavItem = styled.a<{ $isActive: boolean }>`
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${({ theme }) => theme.color.primary[400]};
  border-radius: 4px;
  ${({ theme }) => theme.typography.heading7};

  ${({ theme, $isActive }) =>
    $isActive &&
    css`
      background-color: ${theme.color.primary[200]};
      color: ${({ theme }) => theme.color.primary[600]};
    `}

  &:hover {
    text-decoration: none;
    background-color: ${({ theme }) => theme.color.primary[50]};
    color: ${({ theme }) => theme.color.primary[600]};
  }

  svg {
    width: 24px;
    max-width: unset;
    height: 24px;
    max-height: unset;
  }
`;
