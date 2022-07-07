import { FC, useState } from 'react';
import { IconButton } from '../../generic/icon-button';
import { HamburgerMenuIcon } from '../../svg/hamburgerMenu';
import { CtaWrapper, Overlay } from '../pageHeadStyles';
import { MainMenuList } from './mainMenuList';

type Props = {
  className?: string;
};

export const MainMenu: FC<Props> = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <CtaWrapper>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} />}
      <IconButton onClick={() => setIsExpanded(!isExpanded)}>
        <HamburgerMenuIcon />
        {isExpanded && <MainMenuList />}
      </IconButton>
    </CtaWrapper>
  );
};
