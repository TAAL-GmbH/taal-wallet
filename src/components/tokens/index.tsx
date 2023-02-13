import { FC } from 'react';
import styled from 'styled-components';
import { useGetTokensQuery } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import { BackButton } from '../backButton';
import { Heading } from '../generic/heading';
import { IconButton } from '../generic/icon-button';
import { Tooltip } from '../generic/tooltip';
import { RefreshIcon } from '../svg/refreshIcon';
import { TokenIcon } from '../svg/tokenIcon';
import { CurrentAccount } from '../currentAccount';
import { PortfolioTableHeader } from './table-header';
import { TokenItem } from './token-item';
import { Note } from '../generic/note';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching, refetch } = useGetTokensQuery(activePk.address);

  const tokenList = data?.tokens || [];

  let contents: JSX.Element | null = null;

  if (isFetching) {
    contents = <div>Loading...</div>;
  } else if (tokenList.length === 0) {
    contents = <Note size="lg">No tokens found</Note>;
  } else {
    contents = (
      <PortfolioGrid>
        <PortfolioTableHeader />
        {tokenList.map(token => (
          <TokenItem key={`${token.redeemAddr}-${token.symbol}`} token={token} />
        ))}
      </PortfolioGrid>
    );
  }

  return (
    <Wrapper className={className}>
      <CurrentAccount />
      <BackButton />

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
        Tokens
      </Heading>

      {contents}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const PortfolioGrid = styled.div`
  width: 100%;
  display: grid;
  column-gap: 1rem;
  row-gap: 0.6rem;
  grid-template-columns: min-content minmax(0, auto) min-content;
`;
