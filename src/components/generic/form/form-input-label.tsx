import { FC, HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

import { injectSpacing } from '@/utils/inject-spacing';
import { InjectSpacing } from '@/types/index';

type Props = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  padding?: string;
} & HTMLAttributes<HTMLLabelElement>;

export const FormInputLabel: FC<Props> = ({ className, padding, children, ...rest }) => {
  return (
    <Wrapper className={className} $padding={padding} {...rest}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.label<InjectSpacing>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.color.grey[800]};

  ${injectSpacing(['padding'])}
`;
