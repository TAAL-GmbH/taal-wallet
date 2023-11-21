import { FC } from 'react';
import { styled } from 'styled-components';

import { gap } from '@/utils/inject-spacing';
import { Circle } from '@/svg/circle';
import { useAppSelector } from '@/hooks/index';

export const ConnectionStatus: FC = () => {
  const { connectedList } = useAppSelector(state => state.client);
  const isConnected = connectedList.length > 0;

  return (
    <Wrapper $isConnected={isConnected}>
      <Circle />
      {isConnected ? 'Website connected' : 'Website not connected'}
    </Wrapper>
  );
};

const Wrapper = styled.span<{ $isConnected: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme, $isConnected }) => ($isConnected ? theme.color.success[600] : theme.color.grey[600])};
  white-space: nowrap;
  ${({ theme }) => theme.typography.body4};
  ${gap`xs`};
`;
