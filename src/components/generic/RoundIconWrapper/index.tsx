import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
};

export const RoundIconWrapper: FC<Props> = ({ className, children }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

const Wrapper = styled.div`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.accent[400]};
  position: relative;
  top: -0.3rem;
  width: 2.5rem;
  height: 2.5rem;

  svg {
    width: 80%;
    fill: #fff;
  }
`;
