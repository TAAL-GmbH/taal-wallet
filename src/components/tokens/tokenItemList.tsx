import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { Dl, Li, Ul } from '../generic/styled';
import { PageLoading } from '../loadingPage';

type Props = {
  list: any[];
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
          {list.map(({ protocol, balance, image, redeemAddr, symbol, tokenBalance }) => (
            <Li key={symbol}>
              <Dl>
                <dt>Protocol:</dt>
                <dd>{protocol}</dd>
                <dt>Image:</dt>
                <dd>{image}</dd>
                <dt>Balance:</dt>
                <dd>{balance}</dd>
                <dt>Redeem Addr:</dt>
                <dd>{redeemAddr}</dd>
                <dt>Symbol:</dt>
                <dd>{symbol}</dd>
                <dt>Token Balance:</dt>
                <dd>{tokenBalance}</dd>
              </Dl>
            </Li>
          ))}
        </Ul>
      )}
    </>
  );
};

const Wrapper = styled.div`
  //
`;
