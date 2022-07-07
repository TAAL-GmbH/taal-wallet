import { FC } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  children: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export const NetworkPill: FC<Props> = ({ className, children, size = 'md' }) => {
  return (
    <Wrapper className={className} networkId={children} size={size}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.span<{ networkId: string; size: Props['size'] }>`
  font-size: 0.5rem;
  font-weight: bold;
  letter-spacing: 0.05rem;
  padding: 0.2rem 0.2rem 0.1rem;
  text-transform: uppercase;
  color: #fff;
  border-radius: 0.2rem;

  ${({ networkId, theme }) => {
    const colorMap = {
      mainnet: theme.color.success[400],
      testnet: theme.color.accent[400],
      taalnet: theme.color.primary[400],
    };
    return css`
      background-color: ${colorMap[networkId]};
    `;
  }}
`;
