import React, { useEffect, useState } from 'react';
import logo from '@/assets/img/logo.svg';
import styled from 'styled-components';
import { Button } from '@/src/components/button';
import { init } from './popup-init';
import { WOC } from './WOCLib';
import { Token } from './Token';

const woc = new WOC();

type TokenType = {
  balance: number;
  symbol: string;
};

const Popup = () => {
  const [pk, setPk] = useState<unknown>(null);
  const [satoshis, setSatoshis] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenType[]>([]);

  useEffect(() => {
    init(setPk);
  }, []);

  const refreshBalanceListener = resp => {
    setSatoshis(resp.satoshis);
    setTokens(resp.tokenBalances);
  };

  const refreshBalance = () => {
    woc.balanceAsync({ refreshBalanceListener }, pk.address);
  };

  useEffect(() => {
    if (!pk) return;
    refreshBalance();
  }, [pk]);

  const mintToken = async () => {
    let token = new Token();
    try {
      let symbol = await token.mint(pk);
      alert('Token ' + symbol + ' minted.');
      refreshBalance();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <Wrapper>
      <header className="App-header">
        <Logo src={logo} alt="logo" />
        <h1>hello</h1>
        <h3>Balance: {satoshis} satoshis</h3>
        <Ul>
          {tokens.map(({ balance, symbol }, idx) => (
            <li key={idx}>
              <span>{symbol}</span>
              <span>{balance} satoshis</span>
            </li>
          ))}
        </Ul>
        <Button variant="primary" onClick={mintToken}>
          Mint
        </Button>
      </header>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
`;

const Logo = styled.img`
  width: 200px;
  margin-bottom: 2rem;
`;

const Ul = styled.ul`
  list-style: none;
  font-size: 1.2rem;
  padding: 0;

  li {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ccc;
    white-space: nowrap;
  }
`;

// const Heading = styled.h1`
//   color: ${({ theme }) => theme.color.primary[200]};
// `;

export default Popup;
