import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { useGetHistoryQuery } from '@/src/features/wocApiSlice';
import { Dl, Li, Ul } from '@/components/generic/styled';
import { QuickWalletSelector } from '../quickWalletSelector';
import { HistoryIcon } from '../svg/historyIcon';
import { Heading } from '../generic/heading';
import { Tooltip } from '../generic/tooltip';
import { IconButton } from '../generic/icon-button';
import { RefreshIcon } from '../svg/refreshIcon';

type Props = {
  className?: string;
};

export const History: FC<Props> = ({ className }) => {
  const { activePk, network } = useAppSelector(state => state.pk);
  const { data: list, isLoading, refetch } = useGetHistoryQuery(activePk.address);

  if (isLoading) {
    return <Wrapper>Loading...</Wrapper>;
  }

  return (
    <Wrapper className={className}>
      <QuickWalletSelector />
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
        Your Wallet's history
      </Heading>

      {!list.length && (
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
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
