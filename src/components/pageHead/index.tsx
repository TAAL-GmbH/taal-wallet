import { FC, useState } from 'react';
import styled from 'styled-components';
import { TaalLogo } from '@/src/components/svg/taalLogo';
import { injectSpacing } from '@/src/utils/injectSpacing';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { HamburgerMenuIcon } from '../svg/hamburger-menu';
import { TopMenu } from '../topMenu';
import { AppLogo } from '../appLogo';

const menuButtonHeight = '2.5rem';

type Props = {
  className?: string;
};

export const PageHead: FC<Props> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <Wrapper className={className}>
      <HomeButton onClick={() => navigateTo(routes.HOME)}>
        <AppLogo />
      </HomeButton>

      {isMenuOpen && <Backdrop onClick={() => setIsMenuOpen(false)} />}

      <MenuButton onClick={() => setIsMenuOpen(current => !current)}>
        <HamburgerMenuIcon />
        {isMenuOpen && <MenuBox />}
      </MenuButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.6rem;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 100;
`;

const HomeButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const MenuButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  z-index: 3;

  svg {
    fill: #000;
    width: ${menuButtonHeight};
    height: ${menuButtonHeight};
  }
`;

const MenuBox = styled(TopMenu)`
  position: absolute;
  top: ${menuButtonHeight};
  right: 0;
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  z-index: 2;
`;
