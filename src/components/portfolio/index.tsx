import { FC } from 'react';
import { useGetTokensQuery } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import { Grid } from '../generic/grid';
import { tokenDataMock } from './data-mock';
import { PortfolioTableHeader } from './table-header';
import { TokenItem } from './token-item';

export const Portfolio: FC = () => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching, refetch } = useGetTokensQuery('activePk.address');

  const tokenList = (data?.tokens || tokenDataMock.tokens) as typeof data.tokens;

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Portfolio</h1>
      <Grid gap={'10px 4px'}>
        <PortfolioTableHeader />
        {tokenList.map(token => (
          <TokenItem key={token.symbol} token={token} />
        ))}
      </Grid>
    </div>
  );
};
