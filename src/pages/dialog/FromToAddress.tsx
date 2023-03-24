import { FC } from 'react';
import styled, { css } from 'styled-components';

import { parseRecipientListFromTx } from '@/src/utils/blockchain';
import { AbstractIcon01 } from '@/src/components/svg/abstractIcon01';
import { AbstractIcon02 } from '@/src/components/svg/abstractIcon02';
import { Arrow2 } from '@/src/components/svg/arrow2';
import { injectSpacing } from '@/src/utils/injectSpacing';
import { useAppSelector } from '@/src/hooks';

type Props = {
  recipientList: ReturnType<typeof parseRecipientListFromTx>;
  margin?: string;
};

const formatAddress = (address: string) => `${address.slice(0, 5)}...${address.slice(-5)}`;

export const FromToAddress: FC<Props> = ({ recipientList, margin }) => {
  const state = useAppSelector(state => state.pk.activePk);

  return (
    <Wrapper margin={margin}>
      <Addr>
        <AbstractIcon01 /> {formatAddress(state?.address || '')}
      </Addr>
      <Arrow2Styled direction="right" />
      <Addr alignRight>
        <AbstractIcon02 /> {formatAddress(recipientList[0].address)}
      </Addr>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content 1fr;

  ${injectSpacing(['margin'])};
`;

const Addr = styled.div<{ alignRight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ alignRight }) =>
    alignRight &&
    css`
      justify-content: flex-end;
    `}
`;

const Arrow2Styled = styled(Arrow2)`
  fill: ${({ theme }) => theme.color.grey[600]};
  width: 24px;
`;
