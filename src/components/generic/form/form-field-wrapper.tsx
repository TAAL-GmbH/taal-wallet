import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { InjectSpacing } from '@/types';
import { injectSpacing } from '@/utils/inject-spacing';

type Props = {
  children: ReactNode;
  className?: string;
  margin: string;
};

export const FormFieldWrapper: FC<Props> = ({ className, children, margin }) => {
  return (
    <Wrapper className={className} $margin={margin}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<InjectSpacing>`
  display: flex;
  flex-direction: column;
  user-select: none;
  /* padding: 0 0.4rem; */

  ${injectSpacing(['margin', 'padding'])}
`;
