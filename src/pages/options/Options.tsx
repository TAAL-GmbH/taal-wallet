import React, { FC } from 'react';
import { AppLogo } from '@/src/components/appLogo';
import styled from 'styled-components';
import { ClientList } from './ClientList';

export const Options: FC = () => {
  return (
    <Wrapper>
      <Modal>
        <AppLogo />
        <section>
          <h2>Websites with access to TAAL Wallet</h2>
          <ClientList />
        </section>
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.color.bodyBg};

  h1 {
    font-size: 1.4rem;
    margin-top: 0.4rem;
  }

  h2 {
    font-size: 1.1rem;
  }
`;

const Modal = styled.div`
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  min-width: 400px;
  min-height: 300px;
  padding: 1rem;
  background-color: #fff;
`;
