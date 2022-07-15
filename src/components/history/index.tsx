import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { useGetHistoryQuery } from '@/src/features/wocApiSlice';
import { QuickWalletSelector } from '../quickWalletSelector';
import { HistoryIcon } from '../svg/historyIcon';
import { Heading } from '../generic/heading';
import { Tooltip } from '../generic/tooltip';
import { IconButton } from '../generic/icon-button';
import { RefreshIcon } from '../svg/refreshIcon';
import { HistoryItemList } from './historyItemList';
import { BackButton } from '../backButton';
import { CurrentAccount } from '../currentAccount';

type Props = {
  className?: string;
};

export const History: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data: list, isFetching, refetch } = useGetHistoryQuery(activePk.address);

  return (
    <Wrapper className={className}>
      <CurrentAccount />
      <BackButton />
      <Heading
        icon={<HistoryIcon />}
        cta={
          <Tooltip contents="Refetch history">
            <IconButton onClick={refetch}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        Your wallet's history
      </Heading>
      <HistoryItemList list={list} isFetching={isFetching} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
