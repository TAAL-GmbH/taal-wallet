import { History } from '@/src/features/wocApiSlice';
import { useAppSelector } from '@/src/hooks';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { Dl, Li, Ul } from '../generic/styled';
import { PageLoading } from '../loadingPage';

type Props = {
  list: History[];
  isFetching: boolean;
};

export const HistoryItemList: FC<Props> = ({ list = [], isFetching }) => {
  const { network } = useAppSelector(state => state.pk);

  return (
    <>
      {isFetching && <PageLoading />}

      {!isFetching && !list.length && (
        <div>
          <p>No records found.</p>
        </div>
      )}

      {!!list.length && (
        <Ul>
          {list.map(({ height, tx_hash: txHash }) => (
            <Li key={txHash}>
              <Dl>
                <dt>Height:</dt>
                <dd>{height}</dd>
                <dt>TX ID:</dt>
                <dd>
                  <a href={`https://${network.wocNetwork}.whatsonchain.com/tx/${txHash}`} target="_blank">
                    {txHash}
                  </a>
                </dd>
              </Dl>
            </Li>
          ))}
        </Ul>
      )}
    </>
  );
};
