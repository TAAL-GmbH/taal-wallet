import { FC } from 'react';
import styled from 'styled-components';

import { Grid } from '@/generic/grid';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { NftMediaPreview } from '@/components/nft-media-preview';
import { TokenDetails } from '@/features/woc-api-slice';
import { useAppSelector } from '@/hooks/index';
import { gap } from '@/utils/inject-spacing';
import { CopyToClipboard } from '../generic/copy-to-clipboard';
import { truncateText } from '@/utils/text-utils';

type Props = {
  tokenData: TokenDetails['token'];
  isFungible: boolean;
  issueTxId: string;
};

export const DetailsView: FC<Props> = ({ issueTxId, tokenData, isFungible }) => {
  const { network } = useAppSelector(state => state.pk);

  // const tokenCount = tokenData.total_supply / tokenData.sats_per_token;
  // console.log('tokenData', tokenData);
  // totalSupply / satsPerToken

  return (
    <>
      {isFungible === false && <NftMediaPreview issueTxId={issueTxId} />}

      <Grid columns={2} gap="30px">
        <Dl>
          <dt>Token logo</dt>
          <ImageWithFallbackStyled src={tokenData.image} />
        </Dl>

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

        <Dl>
          <dt>Token type</dt>
          <dd>{typeof isFungible === 'undefined' ? 'Loading...' : isFungible ? 'Fungible' : 'NFT'}</dd>
        </Dl>
        <Dl>
          <dt>Token symbol</dt>
          <dd>{tokenData.symbol}</dd>
        </Dl>
        <Dl>
          <dt>Total supply</dt>
          <dd>{tokenData.total_supply / tokenData.sats_per_token}</dd>
        </Dl>
        <Dl>
          <dt>Sats per token</dt>
          <dd>{tokenData.sats_per_token}</dd>
        </Dl>
        {/* <Dl>
          <dt>Decimals</dt>
          <dd>{tokenData.decimals || 'n/a'}</dd>
        </Dl> */}
        <Dl>
          <dt>Description</dt>
          <dd>{tokenData.description}</dd>
        </Dl>
        <Dl $fullWidth>
          <dt>Contract TX</dt>
          <dd>
            {truncateText(tokenData.contract_txs[0], 12, 12)}{' '}
            <CopyToClipboard textToCopy={tokenData.contract_txs[0]} />
          </dd>
        </Dl>
        <Dl $fullWidth>
          <dt>Issuance TX</dt>
          <dd>
            {truncateText(tokenData.issuance_txs[0], 12, 12)}{' '}
            <CopyToClipboard textToCopy={tokenData.issuance_txs[0]} />
          </dd>
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
    </>
  );
};

const ImageWithFallbackStyled = styled(ImageWithFallback)`
  max-width: 120px;
  max-height: 120px;
`;

const Dl = styled.dl<{ $fullWidth?: boolean }>`
  ${({ $fullWidth }) => $fullWidth && 'grid-column: span 2;'};
  display: flex;
  flex-direction: column;
  margin: 0;
  ${gap`sm`};

  dt {
    ${({ theme }) => theme.typography.heading7};
    color: ${({ theme }) => theme.color.grey[600]};
    text-transform: uppercase;
  }
  dd {
    ${({ theme }) => theme.typography.body2};
    color: ${({ theme }) => theme.color.grey[800]};
    margin: 0;

    small {
      font-size: 80%;
    }

    &:empty:after {
      content: 'N/A';
    }
  }
`;
