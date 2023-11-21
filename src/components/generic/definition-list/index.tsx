import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { injectSpacing, margin } from '@/utils/inject-spacing';
import { InjectSpacing } from '@/types/index';

type Props = {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  margin?: string;
};

export const DefinitionList: FC<Props> = ({ children, margin }) => {
  return <Wrapper $margin={margin}>{children}</Wrapper>;
};

const Wrapper = styled.dl<InjectSpacing>`
  ${injectSpacing(['margin'])};

  > div {
    border: 2px solid red;
  }

  dt {
    ${({ theme }) => theme.typography.heading7};
    color: ${({ theme }) => theme.color.grey[600]};
  }
  dd {
    ${({ theme }) => theme.typography.heading6};
    color: ${({ theme }) => theme.color.grey[800]};
    text-align: right;
    ${margin`0 0 lg`};
  }
`;
