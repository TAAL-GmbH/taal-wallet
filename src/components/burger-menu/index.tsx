import { FC, useState } from 'react';
import { css, styled } from 'styled-components';

import { IconButton } from '@/generic/icon-button';
import { HamburgerMenuIcon } from '@/components/svg/hamburger-menu';
import { CloseIcon } from '@/components/svg/close-icon';

import { MenuBox } from './menu-box';

export const BurgerMenu: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Wrapper>
      <Button onClick={() => setIsExpanded(!isExpanded)} $isExpanded={isExpanded}>
        {isExpanded ? <CloseIcon /> : <HamburgerMenuIcon />}
      </Button>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} />}
      {isExpanded && <MenuBox onClick={() => setIsExpanded(false)} />}
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const Button = styled(IconButton)<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  padding: 0;
  width: 36px;
  height: 36px;

  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
  }

  svg {
    color: ${({ theme }) => theme.color.primary[600]};
  }

  ${({ $isExpanded }) =>
    $isExpanded
      ? css`
          svg {
            height: 24px;
          }
        `
      : css`
          svg {
            height: 14px;
          }
        `};
`;

const Overlay = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.constant.topNavBarHeight};
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.color.grey[800]};
  opacity: 0.75;
`;
