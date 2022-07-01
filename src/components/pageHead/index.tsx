import { FC, useState } from 'react';
import styled from 'styled-components';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { HamburgerMenuIcon } from '../svg/hamburgerMenu';
import { TopMenu } from '../topMenu';
import { AppLogo } from '../appLogo';
import { ExpandIcon } from '../svg/expandIcon';
import { IconButton } from '../generic/icon-button';
import { isPopup } from '@/src/utils/generic';

const menuButtonHeight = '2.5rem';

type Props = {
  className?: string;
};

export const PageHead: FC<Props> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openInTab = () => chrome.tabs.create({ url: window.location.href });

  return (
    <Wrapper className={className}>
      <LogoWrapper>
        <HomeButton onClick={() => navigateTo(routes.HOME)}>
          <AppLogo />
        </HomeButton>
      </LogoWrapper>

      {isMenuOpen && <Backdrop onClick={() => setIsMenuOpen(false)} />}

      {isPopup() && (
        <ExpandButton onClick={openInTab}>
          <ExpandIconStyled />
        </ExpandButton>
      )}

      <MenuButton onClick={() => setIsMenuOpen(current => !current)}>
        <HamburgerMenuIcon />
        {isMenuOpen && <MenuBox />}
      </MenuButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 800px;
  padding: 0.5rem 0;
  margin: 0 auto;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
`;

const LogoWrapper = styled.div`
  flex-grow: 1;
`;

const HomeButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const ExpandButton = styled(IconButton)`
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const MenuButton = styled(IconButton)`
  position: relative;
`;

const ExpandIconStyled = styled(ExpandIcon)`
  width: calc(${menuButtonHeight} * 0.5);
  height: calc(${menuButtonHeight} * 0.5);
`;

const MenuBox = styled(TopMenu)`
  position: absolute;
  top: 1.5rem;
  right: 0;
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
`;
