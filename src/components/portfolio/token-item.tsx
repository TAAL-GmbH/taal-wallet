import { FC } from 'react';
import styled from 'styled-components';
import { Token } from '@/src/features/wocApiSlice';
import { Cell } from '../generic/grid';
import { routes } from '@/src/constants/routes';
import { AnchorLink } from '../anchorLink';
import { ImageWithFallback } from '../imageWithFallback';
import { isPopup } from '@/src/utils/generic';

type Props = {
  token: Token;
};

export const TokenItem: FC<Props> = ({ token }) => {
  const {
    image,
    // symbol,
    balance,
    // protocol,
    name,
    description,
  } = token;

  const linkProps = {
    href: `${routes.PORTFOLIO}/${token.redeemAddr}/${token.symbol}`,
    target: '_blank',
    rel: 'noreferrer',
  };

  return (
    <>
      <Cell align="center center">
        <AnchorLink {...linkProps}>
          <ImageWithFallbackStyled src={image} />
        </AnchorLink>
      </Cell>
      <DetailsCell align="center left">
        <AnchorLink {...linkProps}>
          <Name>{name}</Name>
          <Description>{description.slice(0, isPopup() ? 40 : 80)}</Description>
        </AnchorLink>
      </DetailsCell>
      <BalanceCell align="right center">{balance}</BalanceCell>
    </>
  );
};

const ImageWithFallbackStyled = styled(ImageWithFallback)`
  width: 32px;
  height: 32px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.color.grey[100]};
`;

const DetailsCell = styled(Cell)`
  flex-direction: column;

  * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    color: ${({ theme }) => theme.color.grey[700]};
  }
`;

const Name = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const Description = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.grey[200]};
`;

const BalanceCell = styled(Cell)`
  white-space: nowrap;
`;
