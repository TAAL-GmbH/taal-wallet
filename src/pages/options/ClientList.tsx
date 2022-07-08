import { Heading } from '@/src/components/generic/heading';
import { db } from '@/src/db';
import { OriginType } from '@/src/types';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
};

export const ClientList: FC<Props> = ({ className }) => {
  const [clients, setClients] = useState<null | OriginType[]>(null);

  const getClients = async () => {
    setClients(await db.getOriginList());
  };

  useEffect(() => {
    getClients();
  }, []);

  const deleteOrigin = async (origin: string) => {
    await db.deleteOrigin(origin);
    getClients();
    // TODO: disconnect origin if it's connected (broadcast)
  };

  if (clients === null) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper className={className}>
      <Heading>Websites with access to TAAL Wallet</Heading>

      {!clients.length && <h3>No clients found</h3>}
      {clients.map(client => {
        return (
          <Li key={client.origin}>
            <span>{client.origin}</span>
            <RemoveCta onClick={() => deleteOrigin(client.origin)}>X</RemoveCta>
          </Li>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.ul`
  list-style: none;
  padding: 0;
`;

const Li = styled.li`
  display: flex;
  flex: 1;
  justify-content: space-between;
  padding: 0.4rem 0.5rem;
  margin: 0 -0.5rem;

  &:hover {
    background-color: #fafafa;
  }
`;

const RemoveCta = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 50%;
  padding: 0.5rem;
  cursor: pointer;
  width: 1.2rem;
  height: 1.2rem;
  line-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.color.grey[600]};
    color: ${({ theme }) => theme.color.grey[50]};
  }
`;
