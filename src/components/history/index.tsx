import { FC } from 'react';

import { useAppSelector } from '@/hooks';
import { useGetHistoryQuery } from '@/features/woc-api-slice';
import { Layout } from '@/components/layout/default-layout';
import { PageLoading } from '@/components/loading-page';
import { Ul } from '@/generic/list/ul';

import { HistoryListItem } from './history-list-item';
import { NoHistory } from './no-history';

export const History: FC = () => {
  const { activePk } = useAppSelector(state => state.pk);
  const { data: list, isFetching } = useGetHistoryQuery({ address: activePk.address });

  const header = (
    <>
      <span />
      <span>Transaction history</span>
    </>
  );

  let contents: JSX.Element | null = null;

  const noHistory = !isFetching && !list?.length;

  if (isFetching) {
    contents = <PageLoading />;
  } else if (noHistory) {
    contents = <NoHistory />;
  } else {
    contents = (
      <Ul>
        {list.map(({ tx_hash: txHash, height }) => (
          <HistoryListItem key={txHash} txHash={txHash} height={height} />
        ))}
      </Ul>
    );
  }

  return (
    <Layout header={header} wideContent vcenter={noHistory}>
      {contents}
    </Layout>
  );
};
