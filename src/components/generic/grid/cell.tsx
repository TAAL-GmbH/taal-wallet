import { FC, InputHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { isUndefined } from '@/src/utils/generic';

type Props = {
  startAt?: number;
  endAt?: number;
  span?: number;
  align?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLDivElement>;

export const Cell: FC<Props> = props => {
  const { children, startAt, endAt, span, align, ...rest } = props;
  const [justifyContent, alignItems] = align?.split(' ') || [];
  return (
    <Wrapper
      {...rest}
      $startAt={startAt}
      $endAt={endAt}
      $span={span}
      $alignItems={alignItems}
      $justifyContent={justifyContent}
    >
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  $startAt?: Props['startAt'];
  $endAt?: Props['endAt'];
  $span?: Props['span'];
  $justifyContent?: string;
  $alignItems?: string;
}>`
  display: flex;

  ${({ $startAt }) =>
    !isUndefined($startAt) &&
    css`
      grid-column-start: ${$startAt};
    `};

  ${({ $endAt }) =>
    !isUndefined($endAt) &&
    css`
      grid-column-end: ${$endAt};
    `};

  ${({ $span }) =>
    !isUndefined($span) &&
    css`
      grid-column-end: span ${$span};
    `};

  ${({ $alignItems }) =>
    !isUndefined($alignItems) &&
    css`
      align-items: ${$alignItems};
    `};
  ${({ $justifyContent }) =>
    !isUndefined($justifyContent) &&
    css`
      justify-content: ${$justifyContent};
    `};
`;
