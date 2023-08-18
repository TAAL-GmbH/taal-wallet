import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { Header } from '@/components/header';
import { NavBar } from '@/components/navbar';
import { bp } from '@/utils/breakpoints';

import { ContentBox } from './content-box';
import { Grid } from './grid';

type Props = {
  className?: string;
  children: ReactNode;
  header?: ReactNode;
  center?: boolean;
  vcenter?: boolean;
  wideContent?: boolean;
};

export const Layout: FC<Props> = ({
  className,
  children,
  header,
  center = false,
  vcenter = false,
  wideContent = false,
}) => {
  return (
    <Wrapper id="wrapper" className={className}>
      <Header />
      <Grid id="main-grid">
        <NavBar />
        <ContentBoxStyled
          id="content"
          center={center}
          vcenter={vcenter}
          header={header}
          showBackButton={false}
          maxWidth={wideContent ? 'unset' : undefined}
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

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.color.bodyBgColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

  ${({ theme }) => {
    const topPadding = `calc(${theme.layout.topNavBarHeight} + ${theme.spacing.md})`;
    return css`
      padding-top: ${topPadding};
      min-width: ${theme.constant.bodyMinWidth};
      // min-height: ${theme.constant.bodyMinHeight};
      min-height: 100vh;
    `;
  }};

  ${bp.mobile`
    padding-top: ${({ theme }) => theme.layout.topNavBarHeight};
    background-color: unset;
  `};
`;
