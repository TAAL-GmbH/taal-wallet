import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/generic/button';

type Props = {
  children?: ReactNode;
};

export const ErrorPage: FC<Props> = ({ children }) => {
  return (
    <ErrorMessage>
      <div>Oops, something went wrong!</div>
      {children && <div>{children}</div>}
      <Button onClick={() => chrome.runtime.reload()}>Reload wallet</Button>
    </ErrorMessage>
  );
};

const ErrorMessage = styled.div`
  font-size: 1rem;
  margin: 4rem 0 2rem;
  text-align: center;

  > div {
    margin-bottom: 1rem;
  }
`;
