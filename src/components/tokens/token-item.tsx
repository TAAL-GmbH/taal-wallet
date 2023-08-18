import { FC } from 'react';
import styled from 'styled-components';

import { Token } from '@/features/woc-api-slice';
import { routes } from '@/constants/routes';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Li } from '@/generic/list/li';

type Props = {
  token: Token;
};

export const TokenItem: FC<Props> = ({ token }) => {
  const { image, name, tokenBalance } = token;

  return (
    <li>
      <Li as="a" href={`#${routes.PORTFOLIO}/${token.redeemAddr}/${token.symbol}`} $showSeparator>
        <ImageWithFallbackStyled src={image} />
        <div>
          <Name>{name}</Name>
          <Balance>Token balance: {tokenBalance}</Balance>
        </div>
      </Li>
    </li>
  );
};

const ImageWithFallbackStyled = styled(ImageWithFallback)`
  width: 32px;
  height: 32px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
`;

const Name = styled.div`
  ${({ theme }) => theme.typography.heading6};
  color: ${({ theme }) => theme.color.grey[800]};
`;

const Balance = styled.div`
  ${({ theme }) => theme.typography.heading7};
  color: ${({ theme }) => theme.color.grey[600]};
`;
