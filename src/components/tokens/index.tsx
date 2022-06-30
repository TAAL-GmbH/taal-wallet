import { useGetTokensQuery } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { RoundIconWrapper } from '../generic/RoundIconWrapper';
import { Dl, Li, Ul } from '../generic/styled';
import { QuickWalletSelector } from '../quickWalletSelector';
import { TokenIcon } from '../svg/tokenIcon';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isLoading } = useGetTokensQuery(activePk.address);

  const tokenList = data?.tokens || [];
  console.log({ tokenList });

  if (isLoading) {
    return <Wrapper>Loading...</Wrapper>;
  }

  return (
    <Wrapper className={className}>
      <QuickWalletSelector />
      <h1>
        <RoundIconWrapper>
          <TokenIcon />
        </RoundIconWrapper>
        Your Tokens
      </h1>

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
