import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { injectSpacing } from '@/utils/inject-spacing';

type Props = {
  children: ReactNode;
  className?: string;
  padding?: StyledProps['$padding'];
  margin?: StyledProps['$margin'];
  flex?: StyledProps['$flex'];
  col?: StyledProps['$col'];
  gap?: StyledProps['$gap'];
};

type StyledProps = {
  $margin?: string;
  $padding?: string;
  $gap?: string;
  $flex?: boolean;
  $col?: number;
};

export const Row: FC<Props & StyledProps> = ({
  padding,
  margin = 'sm 0',
  className,
  children,
  flex,
  col,
  gap = 'md',
  ...rest
}) => {
  return (
    <Wrapper
      className={className}
      $padding={padding}
      $margin={margin}
      $flex={flex}
      $col={col}
      $gap={gap}
      {...rest}
    >
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<StyledProps>`
  ${({ $flex }) =>
    $flex &&
    css`
      display: flex;
    `};

  ${({ $col }) => {
    if ($col > 1) {
      return css`
        display: grid;
        grid-template-columns: repeat(${$col}, 1fr);
        ${injectSpacing(['gap'])}
      `;
    }
  }};

  ${injectSpacing(['margin', 'padding'])}
`;
