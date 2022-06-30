import { useGetTokensQuery } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import { FC, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { Heading } from '../generic/heading';
import { IconButton } from '../generic/icon-button';
import { Dl, Li, Ul } from '../generic/styled';
import { Tooltip } from '../generic/tooltip';
import { QuickWalletSelector } from '../quickWalletSelector';
import { RefreshIcon } from '../svg/refreshIcon';
import { TokenIcon } from '../svg/tokenIcon';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isLoading, refetch } = useGetTokensQuery(activePk.address);

  const tokenList = data?.tokens || [];

  useEffect(() => {
    console.log({ isLoading });
  }, [isLoading]);

  if (isLoading) {
    return <Wrapper>Loading...</Wrapper>;
  }

  return (
    <Wrapper className={className}>
      <QuickWalletSelector />

      <Heading
        icon={<TokenIcon />}
        cta={
          <Tooltip contents="Refetch tokens">
            <IconButton onClick={refetch}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        Your Tokens
      </Heading>

      {!tokenList.length && (
        <div>
          <p>No tokens found.</p>
        </div>
      )}

      {!!tokenList.length && (
        <Ul>
          {tokenList.map(({ protocol, balance, image, redeemAddr, symbol, tokenBalance }) => (
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
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
