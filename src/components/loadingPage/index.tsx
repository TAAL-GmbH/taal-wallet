import { FC, ReactNode } from 'react';
import styled, { useTheme } from 'styled-components';
import { Spinner } from '../spinner';

type Props = {
  children?: ReactNode;
  className?: string;
};

export const PageLoading: FC<Props> = ({ className, children = 'Loading...' }) => {
  const theme = useTheme();

  return (
    <Overlay>
      <Wrapper className={className}>
        <Spinner color={theme.color.neutral[600]} size="md" />
        <span>{children}</span>
      </Wrapper>
    </Overlay>
  );
};

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 2000;
`;

const Wrapper = styled.div`
  background-color: #fff;
  border-radius: 1rem;
  padding: 1rem 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;

  span {
    font-size: 1rem;
  }
`;
