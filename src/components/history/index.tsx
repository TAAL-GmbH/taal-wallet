import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { useGetHistoryQuery } from '@/src/features/wocApiSlice';
import { Dl, Li, Ul } from '@/components/generic/styled';
import { QuickWalletSelector } from '../quickWalletSelector';
import { RoundIconWrapper } from '../generic/RoundIconWrapper';
import { HistoryIcon } from '../svg/historyIcon';
import { BlankIcon } from '../svg/blankIcon';

type Props = {
  className?: string;
};

export const History: FC<Props> = ({ className }) => {
  const { activePk, network } = useAppSelector(state => state.pk);
  const { data: list, isLoading } = useGetHistoryQuery(activePk.address);

  if (isLoading) {
    return <Wrapper>Loading...</Wrapper>;
  }

  return (
    <Wrapper className={className}>
      <QuickWalletSelector />
      <h1>
        <RoundIconWrapper>
          <HistoryIcon />
        </RoundIconWrapper>
        Your Wallet's history
      </h1>

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
                <dt>Hash:</dt>
                <dd>{txHash}</dd>
              </Dl>
              <a href={`https://${network.wocNetwork}.whatsonchain.com/tx/${txHash}`} target="_blank">
                View on whatsonchain.com
                <BlankIcon />
              </a>
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
