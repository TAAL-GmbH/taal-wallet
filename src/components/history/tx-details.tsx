import { FC } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@/hooks/index';
import { gap, margin, padding } from '@/utils/inject-spacing';
import { Dl } from '../generic/styled';
import { AnchorLink } from '../anchor-link';
import { TargetBlankIcon } from '../svg/target-blank-icon';
import { truncateText } from '@/utils/text-utils';
import { CopyToClipboard } from '../generic/copy-to-clipboard';
import { useGetTxQuery } from '@/features/woc-api-slice';
import { Spinner } from '../spinner';
import dayjs from 'dayjs';

type Props = {
  txHash: string;
  height: number;
};

export const TxDetails: FC<Props> = ({ txHash, height }) => {
  const { network } = useAppSelector(state => state.pk);
  const { data, isLoading } = useGetTxQuery(txHash);

  const spinner = <Spinner size="xs" />;

  return (
    <Wrapper>
      <DlStyled>
        <dt>Transaction ID</dt>
        <dd>
          {truncateText(txHash, 15, 8)}
          <CopyToClipboard textToCopy={txHash} size="sm" />
        </dd>

        <dt>Block height</dt>
        <dd>{height}</dd>

        <dt>Confirmations</dt>
        <dd>{isLoading ? spinner : data?.confirmations}</dd>

        <dt>Timestamp</dt>
        <dd>
          {isLoading ? spinner : data.time ? dayjs(data?.time * 1000).format('YYYY-MM-DD HH:mm:ss') : 'n/a'}
        </dd>
      </DlStyled>

      <LinkWrapper>
        <AnchorLink
          href={`https://${network.wocNetwork}.whatsonchain.com/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          View on explorer <TargetBlankIcon />
        </AnchorLink>
      </LinkWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.li`
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[100]};
  ${padding`0 xl md`};
`;

const DlStyled = styled(Dl)`
  width: 100%;
  ${({ theme }) => theme.typography.heading6};

  ${gap`lg`};

  dd {
    display: flex;
    align-items: center;
    justify-content: end;
    white-space: nowrap;
    color: ${({ theme }) => theme.color.grey[600]};
    ${gap`sm`};
  }
`;

const LinkWrapper = styled.div`
  text-align: center;
  ${margin`md 0`};

  a {
    color: ${({ theme }) => theme.color.secondary[700]};
    ${({ theme }) => theme.typography.heading7};
  }
`;
