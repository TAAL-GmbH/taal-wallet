import { FC, useState } from 'react';
import styled from 'styled-components';

import { History } from '@/features/woc-api-slice';
import { Li } from '@/generic/list/li';
import { Chevron } from '@/svg/chevron';

import { TxDetails } from './tx-details';

type Props = {
  txHash: History['tx_hash'];
  height: History['height'];
};

export const HistoryListItem: FC<Props> = ({ txHash, height }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => setIsExpanded(!isExpanded);

  return (
    <>
      <LiStyled role="button" onClick={toggleDetails} $showSeparator={!isExpanded}>
        <span />
        <Tx>{txHash}</Tx>
        <ChevronStyled direction={isExpanded ? 'up' : 'down'} />
      </LiStyled>
      {isExpanded && <TxDetails txHash={txHash} height={height} />}
    </>
  );
};

const LiStyled = styled(Li)`
  min-height: 48px;
`;

const Tx = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ theme }) => theme.typography.heading6};
`;

const ChevronStyled = styled(Chevron)`
  width: 18px;
  height: 18px;
`;
