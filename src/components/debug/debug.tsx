import React, { FC, useState } from 'react';
import { store } from '@/src/store';
import styled from 'styled-components';
import { IconButton } from '../generic/icon-button';
import { CloseIcon } from '../svg/closeIcon';

const propsToSanitize = ['privateKey', 'privateKeyHash', 'privateKeyEncrypted'];

const cleanObject = (obj: unknown | unknown[]) => {
  if (Array.isArray(obj)) {
    obj = [...obj] as unknown[];
    return (obj as unknown[]).map(item => cleanObject(item));
  } else if (obj instanceof Object) {
    obj = { ...obj };
    Object.keys(obj).forEach(key => {
      console.log(key);
      if (propsToSanitize.includes(key)) {
        obj[key] = `${obj[key].slice(0, 4)}.......${obj[key].slice(-4)}`;
        // obj[key] = '*****';
      } else {
        obj[key] = cleanObject(obj[key]);
      }
    });
  }
  return obj;
};

type Props = {
  extra?: object | object[];
};

export const Debug: FC<Props> = ({ extra }) => {
  const [isDebugExpanded, setIsDebugExpanded] = useState(!!localStorage.getItem('debug'));
  const extraList = Array.isArray(extra) ? extra : [extra];

  return (
    <Wrapper>
      {!isDebugExpanded && <DebugButton onClick={() => setIsDebugExpanded(true)}>Show Debug</DebugButton>}
      {isDebugExpanded && (
        <JsonWrapper>
          <IconButtonStyled onClick={() => setIsDebugExpanded(false)}>
            <CloseIcon />
          </IconButtonStyled>
          <pre>
            {!!extra && extraList.map(extraItem => JSON.stringify(cleanObject(extraItem), null, 2))}
            {JSON.stringify(cleanObject(store.getState()), null, 2)}
          </pre>
        </JsonWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-top: 6rem;
`;

const JsonWrapper = styled.div`
  max-width: 100%;
  overflow: auto;
  border: 1px solid #ccc;
  padding: 0.5rem;
  position: relative;
  background-color: ${({ theme }) => theme.color.grey[100]};

  pre {
    margin: 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.color.grey[300]};
  }
`;

const IconButtonStyled = styled(IconButton)`
  position: absolute;
  right: 0.2rem;

  svg {
    width: 1.2rem;
  }
`;

const DebugButton = styled.button`
  opacity: 0.2;
`;
