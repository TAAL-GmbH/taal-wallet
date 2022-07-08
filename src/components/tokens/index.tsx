import { FC } from 'react';
import { useGetTokensQuery } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import styled from 'styled-components';
import { BackButton } from '../backButton';
import { Heading } from '../generic/heading';
import { IconButton } from '../generic/icon-button';
import { Tooltip } from '../generic/tooltip';
import { RefreshIcon } from '../svg/refreshIcon';
import { TokenIcon } from '../svg/tokenIcon';
import { TokenItemList } from './tokenItemList';
import { CurrentAccount } from '../currentAccount';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching, refetch } = useGetTokensQuery(activePk.address);

  const tokenList = data?.tokens || [];

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
        Your Tokens
      </Heading>

      <TokenItemList list={tokenList} isFetching={isFetching} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
