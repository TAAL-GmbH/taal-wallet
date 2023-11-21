import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { ContentBox } from './content-box';
import { Grid } from './grid';
import { bp } from '@/utils/breakpoints';

type Props = {
  children: ReactNode;
  header?: ReactNode;
  center?: boolean;
  className?: string;
};

export const MinimalLayout: FC<Props> = ({ children, header = null, center = false, className }) => {
  return (
    <Wrapper id="wrapper">
      <Grid id="main-grid">
        <div />
        <ContentBoxStyled id="content" center={center} header={header} className={className}>
          {children}
        </ContentBoxStyled>
      </Grid>
    </Wrapper>
  );
};

const ContentBoxStyled = styled(ContentBox)<{ center: boolean }>`
  align-self: start;

  ${bp.mobile`
    box-sizing: border-box;
    width: calc(100vw - 24px);
  `};
`;

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.color.bodyBgColor};
  min-height: 100vh;
  padding-top: 10vh;
  box-sizing: border-box;

  ${bp.mobile`
    box-sizing: border-box;
    padding-top: 0;
    background-color: white;
    
    ${ContentBoxStyled} {
      width: 100vw;
      box-sizing: border-box;
      border-radius: 0;
    }
  `};
`;
