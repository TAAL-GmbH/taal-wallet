import { FC } from 'react';
import { styled } from 'styled-components';
import { Chevron } from '@/svg/chevron';
import { gap, padding } from '@/utils/inject-spacing';
import { useAppSelector } from '@/hooks';
import { routes } from '@/constants/routes';

export const WalletSelector: FC = () => {
  const pk = useAppSelector(state => state.pk);
  return (
    <A href={`#${routes.WALLET_LIST}`}>
      <Name>{pk.activePk?.name}</Name>
      <Chevron />
    </A>
  );
};

const A = styled.a`
  background-color: ${({ theme }) => theme.color.primary[100]};
  color: ${({ theme }) => theme.color.primary[600]};
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.xxl};
  height: 24px;
  ${gap`xs`};
  ${padding`0 sm`};

  &:hover {
    // cursor: pointer;
    text-decoration: none;
    background-color: ${({ theme }) => theme.color.primary[200]};
  }

  svg {
    width: 18px;
  }
`;

const Name = styled.span`
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ theme }) => theme.typography.heading7};
`;
