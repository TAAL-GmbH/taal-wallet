import { FC } from 'react';
import styled from 'styled-components';
import { Cell } from '../generic/grid';

export const PortfolioTableHeader: FC = () => {
  return (
    <>
      <HeaderCell span={2}>Assets</HeaderCell>
      <HeaderCell>Balance</HeaderCell>
      <HeaderLine startAt={1} endAt={-1} />
    </>
  );
};

const HeaderCell = styled(Cell)`
  font-weight: bold;
  color: ${({ theme }) => theme.color.grey[300]};
  text-transform: uppercase;
  padding: 8px 0 0;
`;

const HeaderLine = styled(Cell)`
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[200]};
  margin: 0 -1rem 0.5rem;
`;
