import React, { FC, useState } from 'react';
import { store } from '@/src/store';
import styled from 'styled-components';

type Props = {
  extra?: object | object[];
};

export const Debug: FC<Props> = ({ extra }) => {
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);
  const extraList = Array.isArray(extra) ? extra : [extra];

  return (
    <Wrapper>
      {!isDebugExpanded && <DebugButton onClick={() => setIsDebugExpanded(true)}>Show Debug</DebugButton>}
      {isDebugExpanded && (
        <pre onDoubleClick={() => setIsDebugExpanded(false)} style={{ marginTop: '6rem' }}>
          {!!extra && extraList.map(extraItem => JSON.stringify(extraItem, null, 2))}
          {JSON.stringify(store.getState(), null, 2)}
        </pre>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-top: 6rem;
`;

const DebugButton = styled.button`
  opacity: 0.2;
`;
