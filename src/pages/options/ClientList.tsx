import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { OriginData } from '@/src/types';

type Props = {
  className?: string;
};

type Client = OriginData & { origin: string };

export const ClientList: FC<Props> = ({ className }) => {
  const [clients, setClients] = useState<null | Client[]>(null);

  const getClients = async () => {
    const storageData = await chrome.storage.local.get();
    const result: Client[] = [];
    Object.entries(storageData).forEach(([key, value]) => {
      if (key.startsWith('origin: ')) {
        const origin = key.slice('origin: '.length);
        result.push({
          origin,
          ...value,
        });
      }
    });
    setClients(result);
  };

  useEffect(() => {
    getClients();
  }, []);

  const deleteOrigin = async (origin: string) => {
    await chrome.storage.local.remove(`origin: ${origin}`);
    getClients();
  };

  if (clients === null) {
    return <div>Loading...</div>;
  }

  if (!clients.length) {
    return <div>No clients found</div>;
  }

  return (
    <Wrapper className={className}>
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
