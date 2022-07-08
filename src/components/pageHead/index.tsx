import { FC, useState } from 'react';
import styled from 'styled-components';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { AppLogo } from '../appLogo';
import { ExpandIcon } from '../svg/expandIcon';
import { IconButton } from '../generic/icon-button';
import { isPopup } from '@/src/utils/generic';
import { useAppSelector } from '@/src/hooks';
import { LockIcon } from '../svg/lockIcon';
import { AccountMenu } from './accountMenu';
import { MainMenu } from './mainMenu';
import { CurrentAccount } from '../currentAccount';

const menuButtonHeight = '2.5rem';

type Props = {
  className?: string;
  hasRootKey?: boolean;
};

export const PageHead: FC<Props> = ({ className, hasRootKey }) => {
  const { isLocked } = useAppSelector(state => state.pk);
  const { accountList, activeAccountId } = useAppSelector(state => state.account);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openInTab = () => chrome.tabs.create({ url: window.location.href });

  return (
    <>
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

        {accountList.length && <AccountMenu />}
        {isLocked && accountList.length && <LockIconStyled />}
        {!isLocked && <MainMenu />}
      </Wrapper>
      {activeAccountId && <CurrentAccount />}
    </>
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
  padding: 0;
`;

const ExpandButton = styled(IconButton)`
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const LockIconStyled = styled(LockIcon)`
  height: 1.4rem;
  width: 1.4rem;
`;

const ExpandIconStyled = styled(ExpandIcon)`
  width: calc(${menuButtonHeight} * 0.5);
  height: calc(${menuButtonHeight} * 0.5);
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
`;
