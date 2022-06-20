import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { injectSpacing } from '@/utils/injectSpacing';

type Props = {
  children: ReactNode;
  className?: string;
};

type StyledProps = {
  margin?: string | boolean;
  padding?: string | boolean;
  flex?: boolean;
  col?: number;
  gap?: string;
};

export const Row: FC<Props & StyledProps> = ({
  padding,
  margin = 'md 0',
  className,
  children,
  flex,
  col,
  gap = 'md',
  ...rest
}) => {
  return (
    <Wrapper
      padding={padding}
      margin={margin}
      flex={flex}
      className={className}
      col={col}
      gap={gap}
      {...rest}
    >
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<StyledProps>`
  ${({ flex }) =>
    flex &&
    css`
      display: flex;
    `};

  ${({ col }) => {
    if (col > 1) {
      return css`
        display: grid;
        grid-template-columns: repeat(${col}, 1fr);
        ${injectSpacing(['gap'])}
      `;
    }
  }};

  ${injectSpacing(['margin', 'padding'])}
`;
