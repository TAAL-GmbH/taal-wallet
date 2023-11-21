import { FC } from 'react';
import styled from 'styled-components';

import { injectSpacing } from '@/utils/inject-spacing';
import { BurgerMenu } from '@/components/burger-menu';

import { Account } from './account';

type Props = {
  showBurgerMenu?: boolean;
};

export const Header: FC<Props> = ({ showBurgerMenu = true }) => {
  return (
    <Wrapper>
      <Contents>
        <Account />
        {showBurgerMenu && <BurgerMenu />}
      </Contents>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: white;
  height: ${({ theme }) => theme.layout.topNavBarHeight};
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.06);
  ${injectSpacing(['padding'])}
`;

const Contents = styled.div`
  height: ${({ theme }) => theme.layout.topNavBarHeight};
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
`;
