import { FC } from 'react';
import styled from 'styled-components';
import { TaalLogo } from '../svg/taalLogo';

type Props = {
  className?: string;
};

export const AppLogo: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <Logo />
      <Text>Wallet</Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const Logo = styled(TaalLogo)`
  background-color: ${({ theme }) => theme.color.primary[400]};
  padding: 0.25rem;
  width: 60px;
  fill: #fff;
`;

const Text = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  position: relative;
  top: 0.2rem;
  color: ${({ theme }) => theme.color.primary[400]};
`;
