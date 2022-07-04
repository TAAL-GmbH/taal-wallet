import React, { FC, useState } from 'react';
import { store } from '@/src/store';
import styled from 'styled-components';

export const Debug: FC = () => {
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);

  return (
    <>
      {!isDebugExpanded && <DebugButton onClick={() => setIsDebugExpanded(true)}>Show Debug</DebugButton>}
      {isDebugExpanded && (
        <>
          <pre onDoubleClick={() => setIsDebugExpanded(false)} style={{ marginTop: '6rem' }}>
            {JSON.stringify(store.getState().pk, null, 2)}
          </pre>
        </>
      )}
    </>
  );
};

const DebugButton = styled.button`
  margin-top: 6rem;
  opacity: 0.2;
`;
