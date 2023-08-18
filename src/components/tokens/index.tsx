import { FC } from 'react';

import { useGetTokensQuery } from '@/features/woc-api-slice';
import { useAppSelector } from '@/hooks';
import { Ul } from '@/generic/list/ul';
import { Layout } from '@/components/layout/default-layout';

import { TokenItem } from './token-item';
import { NoTokens } from './no-tokens';

type Props = {
  type: 'fungible' | 'nft';
};

export const Tokens: FC<Props> = ({ type }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching } = useGetTokensQuery(activePk.address);

  const isFungible = type === 'fungible';
  const tokenList =
    data?.tokens
      ?.filter(item => item.isFungible === isFungible)
      ?.sort((a, b) =>
        a.name.toUpperCase() > b.name.toUpperCase() ? 1 : b.name.toUpperCase() > a.name.toUpperCase() ? -1 : 0
      ) || [];

  let contents: JSX.Element | null = null;

  if (isFetching) {
    contents = <div>Loading...</div>;
  } else if (tokenList === null || tokenList.length === 0) {
    contents = <NoTokens type={type} />;
  } else {
    contents = (
      <Ul>
        {tokenList.map(token => (
          <TokenItem key={`${token.redeemAddr}-${token.symbol}`} token={token} />
        ))}
      </Ul>
    );
  }

  const header = (
    <>
      <span />
      <span>{type === 'fungible' ? 'Fungible tokens' : 'NFT'}</span>
    </>
  );

  return (
    <Layout header={header} wideContent>
      {contents}
    </Layout>
  );
};
