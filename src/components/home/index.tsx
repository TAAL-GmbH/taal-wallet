import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../button';
import { pk } from '@/src/libs/PK';
import { woc } from '@/src/libs/WOC';
import { CurrentPk } from '../currentPk';
import { useAppSelector } from '@/src/hooks';
import { store } from '@/src/store';
import { fetchBalance } from '@/src/features/pkSlice';

type Props = {
  className?: string;
};

type TokenType = {
  balance: number;
  symbol: string;
};

export const Home: FC<Props> = ({ className }) => {
  const { current } = useAppSelector(state => state.pk);
  const [tokens, setTokens] = useState<TokenType[]>([]);

  const mintToken = async () => {
    // let token = new Token();
    // try {
    //   let symbol = await token.mint(pk);
    //   alert('Token ' + symbol + ' minted.');
    //   refreshBalance();
    // } catch (err) {
    //   alert(err);
    // }
  };

  const airdrop = async () => {
    if (!current?.address) {
      alert('Please select a private key.');
      return;
    }
    const success = await woc.airdrop(current.address);

    if (success) {
      getBalance();
      alert('Airdrop successful');
    }
  };

  const getBalance = async () => {
    if (!current?.address) {
      alert('Please select a private key.');
      return;
    }
    store.dispatch(fetchBalance(current.address));
  };

  useEffect(() => {
    pk.restorePK();
  }, [current]);

  return (
    <Wrapper className={className}>
      <CurrentPk />
      <h3>
        Balance:{' '}
        {Number.isInteger(current?.balance)
          ? `${current?.balance?.toLocaleString()} satoshis`
          : 'unknown'}
      </h3>
      <Ul>
        {tokens.map(({ balance, symbol }, idx) => (
          <li key={idx}>
            <span>{symbol}</span>
            <span>{balance} satoshis</span>
          </li>
        ))}
      </Ul>
      <ButtonWrapper>
        <Button onClick={mintToken}>Mint</Button>
        <Button onClick={getBalance}>Get balance</Button>
        <Button variant="success" onClick={airdrop}>
          Airdrop
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
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

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
