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
import { isPopup } from '@/src/utils/generic';
// import { Grid } from '../generic/grid';
import { PortfolioTableHeader } from '../portfolio/table-header';
import { TokenItem } from '../portfolio/token-item';
import { tokenDataMock } from '../portfolio/data-mock';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching, refetch } = useGetTokensQuery('activePk.address');

  // const tokenList = data?.tokens || [];
  const tokenList = (data?.tokens || tokenDataMock.tokens) as typeof data.tokens;

  const showPortfolio = () => {
    const url = chrome.runtime.getURL('/src/pages/popup/index.html#portfolio');
    isPopup() ? chrome.tabs.create({ url }) : (window.location.href = url);
  };

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
        Portfolio
      </Heading>

      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <PortfolioGrid>
          <PortfolioTableHeader />
          {tokenList.map(token => (
            <TokenItem key={token.symbol} token={token} />
          ))}
        </PortfolioGrid>
      )}

      {/* <Button onClick={showPortfolio}>Show portfolio</Button>

      <TokenItemList list={tokenList} isFetching={isFetching} /> */}
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
  row-gap: 0.1rem;
  grid-template-columns: min-content minmax(0, auto) min-content;
`;
