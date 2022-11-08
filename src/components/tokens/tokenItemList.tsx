import { FC } from 'react';
import { Ul } from '../generic/styled';
import { Token } from '@/src/features/wocApiSlice';
import { PageLoading } from '../loadingPage';
import { TokenItem } from './tokenItem';

type Props = {
  list: Token[];
  isFetching?: boolean;
};

export const TokenItemList: FC<Props> = ({ list = [], isFetching }) => {
  return (
    <>
      {isFetching && <PageLoading />}

      {!isFetching && !list.length && (
        <div>
          <p>No tokens found.</p>
        </div>
      )}

      {!!list.length && (
        <Ul>
          {list.map(token => (
            <TokenItem key={token.symbol} token={token} />
          ))}
        </Ul>
      )}
    </>
  );
};
