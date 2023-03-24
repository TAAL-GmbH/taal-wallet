import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import bsv from 'bsv';

import { isNull } from '@/src/utils/generic';
import { Box } from '@/src/components/generic/box';
import { ImageWithFallback } from '@/src/components/imageWithFallback';

type TokenData = {
  decimals: number;
  description: string;
  image?: string;
  name: string;
  properties: {
    [key: string]: string | number;
  };
  satsPerToken: number;
  symbol: string;
  tokenId: string;
  totalSupply: number;
};

type Props = {
  data: {
    txData: unknown;
    network: string;
  };
};

export const TransactionParser: FC<Props> = ({ data }) => {
  const [tokenData, setTokenData] = useState<TokenData>(null);

  useEffect(() => {
    try {
      // @ts-expect-error data is unknown
      const script = bsv.Script.fromHex(data.outputs?.[0]?.script);
      const d = JSON.parse(script.chunks[6].buf?.toString('utf8'));

      if (d.name && d.symbol && d.tokenId) {
        setTokenData(d);
      } else {
        throw new Error("Can't parse token data");
      }
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  if (isNull(tokenData)) {
    return null;
  }

  return (
    <Box>
      <Title>
        <ImageWithFallbackStyled src={tokenData.image} alt={tokenData.name} />
        {tokenData.name}
      </Title>
      <dl>
        <dt>Name</dt>
        <dd>{tokenData.name}</dd>
      </dl>
      <pre>{JSON.stringify(tokenData, null, 2)}</pre>
    </Box>
  );
};

const Title = styled.h2`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ImageWithFallbackStyled = styled(ImageWithFallback)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;
