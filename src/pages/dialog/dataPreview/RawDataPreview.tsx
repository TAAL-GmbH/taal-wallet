import { FC } from 'react';
import styled from 'styled-components';

import { Box } from '@/src/components/generic/box';

type Props = {
  data: object;
};

export const RawDataPreview: FC<Props> = ({ data }) => {
  return (
    <Wrapper>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  pre {
    border-radius: 12px;
    overflow: auto;
  }
`;
