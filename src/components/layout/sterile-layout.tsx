import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { Header } from '@/components/header';
import { bp } from '@/utils/breakpoints';
import { Arrow } from '@/svg/arrow';
import { IconButton } from '@/generic/icon-button';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';

import { Grid } from './grid';
import { ContentBox } from './content-box';

type Props = {
  children: ReactNode;
  header?: ReactNode;
  center?: boolean;
  showTopHeader?: boolean;
  showBackButton?: boolean;
  showBurgerMenu?: boolean;
  maxWidth?: string;
};

export const SterileLayout: FC<Props> = ({
  children,
  header,
  center = false,
  showTopHeader = true,
  showBackButton = false,
  showBurgerMenu = true,
  maxWidth,
}) => {
  return (
    <Wrapper id="wrapper" $showTopHeader={showTopHeader}>
      {showTopHeader && <Header showBurgerMenu={showBurgerMenu} />}
      {showBackButton && (
        <IconButtonStyled onClick={() => navigateTo(routes.HOME)}>
          <Arrow direction="left" />
        </IconButtonStyled>
      )}
      <Grid id="main-grid">
        <div />
        <ContentBoxStyled
          id="content"
          center={center}
          header={header}
          showBackButton={false}
          maxWidth={maxWidth}
        >
          {children}
        </ContentBoxStyled>
      </Grid>
    </Wrapper>
  );
};

const ContentBoxStyled = styled(ContentBox)`
  align-self: start;

  ${bp.mobile`
    box-sizing: border-box;
    width: calc(100vw - 24px);
    min-width: ${({ theme }) => theme.constant.bodyMinWidth};
  `};
`;

const Wrapper = styled.div<{ $showTopHeader: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ theme, $showTopHeader }) => {
    const topPadding = $showTopHeader ? `calc(${theme.layout.topNavBarHeight} + ${theme.spacing.md})` : '0';
    return css`
      padding-top: ${topPadding};
      min-height: ${theme.constant.bodyMinHeight};

      ${bp.mobile`
        min-height: ${theme.constant.bodyMinHeightMobile};
        background-color: unset;
      `};
    `;
  }};
`;

const IconButtonStyled = styled(IconButton)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  z-index: 100;

  svg {
    color: ${({ theme }) => theme.color.primary[600]};
  }
`;
