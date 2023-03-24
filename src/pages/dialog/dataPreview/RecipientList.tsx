import { FC } from 'react';
import styled from 'styled-components';

import { Box } from '@/src/components/generic/box';
import { DefinitionList } from '@/src/components/generic/definition-list';
import { margin } from '@/src/utils/injectSpacing';

type Props = {
  recipientList: {
    address: string;
    satoshis: number;
    isStandard: boolean;
  }[];
  symbol: string;
};

// const truncateSymbol = (symbol: string) => (symbol.length > 8 ? `${symbol.slice(0, 6)}...` : symbol);

const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-7)}`;

export const RecipientList: FC<Props> = ({ recipientList }) => {
  const total = recipientList.reduce((acc, curr) => acc + curr.satoshis, 0);

  return (
    <BoxStyled>
      <Ul>
        {recipientList.map((recipient, index) => (
          <li key={index}>
            <Address>{formatAddress(recipient.address)}</Address>
            <Satoshis>{recipient.satoshis.toLocaleString()} sats</Satoshis>
          </li>
        ))}
      </Ul>

      <hr />

      <DefinitionList>
        <dt>Total</dt>
        <dd>{total} sats</dd>
      </DefinitionList>
    </BoxStyled>
  );
};

const BoxStyled = styled(Box)`
  pre {
    overflow: auto;
  }
`;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
  ${margin`sm 0 xl`};
  display: flex;
  flex-direction: column;
  gap: 20px;

  li {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const Address = styled.div`
  ${({ theme }) => theme.typography.heading7};
`;

const Satoshis = styled.div`
  ${({ theme }) => theme.typography.heading6};
  text-align: right;
  white-space: nowrap;
`;
