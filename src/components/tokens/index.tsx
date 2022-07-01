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
import { TokenItemList } from './tokenItemList';

type Props = {
  className?: string;
};

export const Tokens: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data, isFetching, refetch } = useGetTokensQuery(activePk.address);

  const tokenList = data?.tokens || [];

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

      <TokenItemList list={tokenList} isFetching={isFetching} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
