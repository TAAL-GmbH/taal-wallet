import { FC } from 'react';
import styled from 'styled-components';

import { InjectSpacing } from '@/types';
import { injectSpacing } from '@/utils/inject-spacing';

type Props = {
  className?: string;
  margin?: string;
  children: React.ReactNode;
};

export const ButtonWrapper: FC<Props> = ({ children, className, margin = 'xxl 0 md' }) => {
  return (
    <Wrapper className={className} $margin={margin}>
      {children}
    </Wrapper>
  );
};

export const Wrapper = styled.div<InjectSpacing>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  width: 100%;
  ${injectSpacing(['margin'])};

  button {
    width: 100%;
  }
`;
