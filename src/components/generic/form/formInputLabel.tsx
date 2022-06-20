import { FC, HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { injectSpacing } from '@/utils/injectSpacing';

type Props = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  padding?: string | boolean;
  labelOnLeft?: boolean;
} & HTMLAttributes<HTMLLabelElement>;

export const FormInputLabel: FC<Props> = ({
  className,
  padding,
  labelOnLeft,
  children,
  ...rest
}) => {
  return (
    <Wrapper
      className={className}
      padding={padding}
      labelOnLeft={labelOnLeft}
      {...rest}
    >
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.label<Props>`
  display: flex;
  flex-direction: column;

  ${({ labelOnLeft }) =>
    labelOnLeft &&
    css`
      display: flex;
      gap: 0.5rem;
      flex-direction: row-reverse;
      justify-content: flex-end;
      align-items: center;
    `}

  ${injectSpacing(['padding'])}
`;
