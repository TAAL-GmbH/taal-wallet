import styled, { css } from 'styled-components';

import { bp } from '@/utils/breakpoints';

export const Grid = styled.div`
  display: grid;
  grid-template-areas: 'navbar content reserved';
  gap: ${({ theme }) => theme.grid.gap};
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;

  ${({ theme }) => {
    const col1Width = 70 + 16;
    const col2Width = 700;
    const col3Width = 70;
    const colTotal = col1Width + col2Width + col3Width + parseInt(theme.grid.gap) * 2; // 827

    return css`
      grid-template-columns: minmax(${col1Width}px, 300px) ${col2Width}px minmax(${col3Width}px, 300px);

      ${bp.custom(null, `${colTotal}px`)`
        grid-template-columns: ${col1Width}px minmax(min-content, ${col2Width}px) minmax(${
        col3Width / 3
      }px, ${col3Width}px);
      `};

      ${bp.mobile`
        grid-template-columns: 1fr;
        grid-template-areas: 'content'
          'navbar'
          'reserved';
        gap: 0;
      `};
    `;
  }};
`;
