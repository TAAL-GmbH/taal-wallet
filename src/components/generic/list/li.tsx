import styled, { css } from 'styled-components';

import { gap, padding } from '@/utils/inject-spacing';

export const Li = styled.li<{ $isActive?: boolean; $showSeparator?: boolean }>`
  display: grid;
  grid-template-columns: min-content auto min-content;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-sizing: border-box;
  ${padding`sm md`};
  ${gap`md`};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.color.primary[200]};
    text-decoration: none;
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    css`
      background-color: ${theme.color.primary[100]};
    `};

  ${({ $showSeparator, theme }) =>
    $showSeparator &&
    css`
      min-height: 54px;
      border-bottom: 1px solid ${theme.color.grey[100]};
    `};
`;
