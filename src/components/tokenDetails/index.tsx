import { FC, useEffect, useState } from 'react';
import { useGetTokenDetailsQuery } from '@/src/features/wocApiSlice';
import styled from 'styled-components';
import { Note } from '../generic/note';
import { Grid } from '../generic/grid';
import { AnchorLink } from '../anchorLink';
import { routes } from '@/src/constants/routes';
import { ImageWithFallback } from '../imageWithFallback';
import { NftMediaPreview } from '../nft-media-preview';
import { useAppSelector } from '@/src/hooks';
import { useTransactionData } from '@/src/hooks/useTransactionData';

// const formatAddress = (address: string) => {
//   return address ? `${address.slice(0, 8)}...${address.slice(-7)}` : 'No address';
// };

type Props = {
  tokenId: string;
  symbol: string;
};

export const TokenDetails: FC<Props> = ({ tokenId, symbol }) => {
  const [issueTxId, setIssueTxId] = useState<string | null>(null);
  const { network } = useAppSelector(state => state.pk);
  const { data, isFetching } = useGetTokenDetailsQuery({ tokenId, symbol });
  const {
    // data,
    // symbol,
    isFungible,
    // error,
  } = useTransactionData({
    issueTxId,
  });

  const tokenData = data?.token;

  useEffect(() => {
    if (tokenData?.issuance_txs.length) {
      setIssueTxId(tokenData.issuance_txs[0]);
    }
  }, [tokenData?.issuance_txs]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (!tokenData) {
    return <Note>Token not found</Note>;
  }

  // const issueTxId = tokenData.issuance_txs[0];

  return (
    <div>
      <AnchorLink href={routes.PORTFOLIO}>&lt; Back to token list</AnchorLink>

      <h1>Token details</h1>

      <NftMediaPreview issueTxId={issueTxId} />

      <Grid columns={2}>
        <Dl>
          <dt>Token logo</dt>
          <ImageWithFallbackStyled src={tokenData.image} />
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
            <dd>{network.label}</dd>
          </Dl>
        </Grid>
        <Dl>
          <dt>Token type</dt>
          {/* <dd>{tokenData.isFungible ? 'Fungible' : 'Non-fungible'}</dd> */}
          <dd>{typeof isFungible === 'undefined' ? 'Loading...' : isFungible ? 'Fungible' : 'NFT'}</dd>
        </Dl>
        <Dl>
          <dt>Token symbol</dt>
          <dd>{tokenData.symbol}</dd>
        </Dl>
        <Dl>
          <dt>Total supply</dt>
          <dd>{tokenData.total_supply.toLocaleString()}</dd>
        </Dl>
        {/* <Dl>
          <dt>Decimals</dt>
          <dd>{tokenData.decimals || 'n/a'}</dd>
        </Dl> */}
        <Dl>
          <dt>Description</dt>
          <dd>{tokenData.description}</dd>
        </Dl>
        {/* <Dl fullWidth>
          <dt>Website URL</dt>
          <dd>{tokenData.websiteUrl}</dd>
        </Dl> */}
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

const ImageWithFallbackStyled = styled(ImageWithFallback)`
  max-width: 120px;
  max-height: 120px;
`;

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
