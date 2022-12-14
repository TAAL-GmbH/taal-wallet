import { FC } from 'react';
import styled from 'styled-components';
import { Token } from '@/src/features/wocApiSlice';
import { Cell } from '../generic/grid';
import { routes } from '@/src/constants/routes';
import { AnchorLink } from '../anchorLink';
import { isPopup } from '@/src/utils/generic';

type Props = {
  token: Token;
};

export const TokenItem: FC<Props> = ({ token }) => {
  const {
    image,
    // symbol,
    balance,
    protocol,
    name,
    description,
  } = token;

  const tokenId = '6306a1410ef9e2746b6bf58079c66d8296df9e5d';
  const symbol = 'symbol654654654';

  const linkProps = {
    href: `${routes.PORTFOLIO}/${tokenId}/${symbol}`,
    target: '_blank',
    rel: 'noreferrer',
  };

  return (
    <>
      <Cell>
        <AnchorLink {...linkProps}>
          <Img src={image} />
        </AnchorLink>
      </Cell>
      <DetailsCell align="center left">
        <AnchorLink {...linkProps}>
          <Name>{name}</Name>
          {/* <Description>{description.slice(0, isPopup() ? 40 : 80)}</Description> */}
          <Description>{description}</Description>
        </AnchorLink>
      </DetailsCell>
      <BalanceCell align="right center">{balance}</BalanceCell>
    </>
  );
};

const Img = styled.img`
  width: 32px;
  height: 32px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  margin: 8px 0;
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
