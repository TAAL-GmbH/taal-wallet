import { FC } from 'react';
import styled from 'styled-components';

import { Box } from '@/src/components/generic/box';
import { ParsedTokenDetails } from '@/src/types';
import { ImageWithFallback } from '@/src/components/imageWithFallback';
import { DefinitionList } from '@/src/components/generic/definition-list';

type Props = {
  data: ParsedTokenDetails;
};

export const TokenDetails: FC<Props> = ({ data }) => {
  return (
    <BoxStyled>
      <Heading>
        <ImageWrapper>
          <ImageWithFallback src={data.image} alt={data.name} />
        </ImageWrapper>
        <h2>{data.name}</h2>
        {data.description && <Description>{data.description}</Description>}
      </Heading>

      <hr />

      <DefinitionList margin="xl 0 md">
        <dt>Symbol</dt>
        <dd>{data.symbol}</dd>
        <dt>Token Id</dt>
        <dd>
          {data.tokenId.slice(0, 10)}...{data.tokenId.slice(-8)}
        </dd>
        <dt>Decimals</dt>
        <dd>{data.decimals}</dd>
        <dt>Total supply</dt>
        <dd>{data.totalSupply} sats</dd>
        <dt>Sats per token</dt>
        <dd>{data.satsPerToken} sats</dd>
      </DefinitionList>
    </BoxStyled>
  );
};

const BoxStyled = styled(Box)`
  pre {
    overflow: auto;
  }
`;

const Heading = styled.div`
  display: grid;
  grid-template-columns: 46px auto;
  gap: 0 12px;

  h2 {
    margin: 0;
  }
`;

const ImageWrapper = styled.div`
  grid-row: 1 / 3;

  img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
  }
`;

const Description = styled.div`
  ${({ theme }) => theme.typography.body3};
  color: ${({ theme }) => theme.color.grey[600]};
`;
