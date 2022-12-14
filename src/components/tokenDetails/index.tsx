import React, { FC } from 'react';
import { useGetTokenDetailsQuery } from '@/src/features/wocApiSlice';
import { useRouter } from 'wouter';
import styled from 'styled-components';
import { injectSpacing } from '@/src/utils/injectSpacing';
import { Note } from '../generic/note';
import { Grid } from '../generic/grid';
import { AnchorLink } from '../anchorLink';
import { routes } from '@/src/constants/routes';

const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 8)}...${address.slice(-7)}` : 'No address';
};

type Props = {
  tokenId: string;
  symbol: string;
};

export const TokenDetails: FC<Props> = ({ tokenId, symbol }) => {
  const router = useRouter();

  const { data, isFetching } = useGetTokenDetailsQuery({ tokenId, symbol });
  console.log({ data, router, tokenId, symbol });

  if (isFetching) {
    return <div>Loading...</div>;
  }

  const tokenData = data?.token;

  if (!tokenData) {
    return <Note>Token not found</Note>;
  }

  return (
    <div>
      <AnchorLink href={routes.PORTFOLIO}>&lt; Back to portfolio</AnchorLink>

      <h1>Token details</h1>

      <Grid columns={2}>
        <Dl>
          <dt>Token logo</dt>
          <dd>
            <Img src={tokenData.image} />
          </dd>
        </Dl>

        <Grid columns={1}>
          <Dl>
            <dt>Token name</dt>
            <dd>{tokenData.name}</dd>
          </Dl>
          <Dl>
            <dt>Protocol</dt>
            <dd>{tokenData.protocol.toUpperCase()}</dd>
          </Dl>
          <Dl>
            <dt>Network</dt>
            {/* <dd style={{ textTransform: 'capitalize' }}>{tokenData.network}</dd> */}
            <dd>n/a</dd>
          </Dl>
        </Grid>
        <Dl>
          <dt>Token type</dt>
          {/* <dd>{tokenData.isFungible ? 'Fungible' : 'Non-fungible'}</dd> */}
          <dd>n/a</dd>
        </Dl>
        <Dl>
          <dt>Token symbol</dt>
          <dd>{tokenData.symbol}</dd>
        </Dl>
        <Dl>
          <dt>Total supply</dt>
          <dd>{tokenData.total_supply.toLocaleString()}</dd>
        </Dl>
        <Dl>
          <dt>Decimals</dt>
          {/* <dd>{tokenData.decimals}</dd> */}
          <dd>n/a</dd>
        </Dl>
        <Dl>
          <dt>Description</dt>
          <dd>{tokenData.description}</dd>
        </Dl>
        <Dl fullWidth>
          <dt>Website URL</dt>
          {/* <dd>{tokenData.websiteUrl}</dd> */}
          <dd>n/a</dd>
        </Dl>
        {/* <Dl fullWidth>
          <dt>Twitter URL</dt>
          <dd>n/a</dd>
        </Dl>
        <Dl fullWidth>
          <dt>Telegram URL</dt>
          <dd>n/a</dd>
        </Dl> */}
      </Grid>
    </div>
  );
};

// const Grid = styled.div<{ col: number; margin?: string }>`
//   display: grid;
//   grid-template-columns: ${({ col = 2 }) => new Array(col).fill('1fr').join(' ')};
//   gap: 1.8rem;

//   ${injectSpacing(['margin'])};
// `;

const Dl = styled.dl<{ fullWidth?: boolean }>`
  ${({ fullWidth }) => fullWidth && 'grid-column: span 2;'};
  display: flex;
  flex-direction: column;
  margin: 0;

  dt {
    text-transform: uppercase;
    font-size: 12px;
  }
  dd {
    color: ${props => props.theme.color.primary[600]};
    margin: 0;
    font-size: 17px;

    small {
      font-size: 15px;
    }

    &:empty:after {
      content: 'N/A';
    }
  }
`;

const Img = styled.img`
  width: 130px;
  height: 130px;
  object-fit: cover;
  object-position: center;
  // border-radius: 50%;
  margin: 8px 0;
  border: 1px solid ${({ theme }) => theme.color.grey[100]};
`;
