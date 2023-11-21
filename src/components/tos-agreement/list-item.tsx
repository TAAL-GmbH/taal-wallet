import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  num: string;
  children: ReactNode;
  isBlock?: boolean;
  as?: 'div' | 'p' | 'h2' | 'h3';
};

export const ListItem: FC<Props> = ({ num, children, isBlock = false, as = 'p' }) => {
  return (
    <ListItemStyled as={as}>
      <ListNumber $isBlock={isBlock}>{num}</ListNumber>
      {children}
    </ListItemStyled>
  );
};

const ListItemStyled = styled.div`
  position: relative;
  padding-left: 40px;
`;

const ListNumber = styled.span<{ $isBlock: boolean }>`
  display: inline-block;
  width: 40px;

  ${({ $isBlock }) => {
    if ($isBlock) {
      return css`
        position: absolute;
        top: 0;
        left: 0;
      `;
    } else {
      return css`
        margin-left: -40px;
      `;
    }
  }}
`;
