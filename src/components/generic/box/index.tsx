import { FC } from 'react';
import styled from 'styled-components';

import { margin, padding } from '@/src/utils/injectSpacing';

type Props = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Box: FC<Props> = ({ children, ...rest }) => {
  return <Wrapper {...rest}>{children}</Wrapper>;
};

const Wrapper = styled.div`
  border-radius: 12px;
  background: ${({ theme }) => theme.color.neutral[100]};
  ${padding`md`};

  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.color.grey[300]};
    ${margin`md 0`};
  }
`;
