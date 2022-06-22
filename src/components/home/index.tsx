import { FC, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../button';
import { CurrentPk } from '../currentPk';
import { useAppSelector } from '@/src/hooks';
import { createToast } from '@/src/utils/toast';
import { airdrop, getBalance } from '@/src/features/wocApiSlice';
import { formatNumber, isNull } from '@/src/utils/generic';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';

type Props = {
  className?: string;
};

type TokenType = {
  balance: number;
  symbol: string;
};

export const Home: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const [tokens, setTokens] = useState<TokenType[]>([]);

  const _airdrop = async () => {
    const toast = createToast('Requesting Airdrop...');
    if (!activePk?.address) {
      toast.error('Please select an Address first!');
      return;
    }
    // const success = await woc.airdrop(activePk.address).catch(toast.error);
    const success = await airdrop(activePk.address).catch(toast.error);

    if (success) {
      setTimeout(_getBalance, 5000);
      toast.success('Airdrop was successful!');
    }
  };

  const _getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!activePk?.address) {
      toast.error('Please select an address');
      return;
    }
    const result = await getBalance([activePk.address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
    }
  };

  return (
    <Wrapper className={className}>
      <CurrentPk />
      <h3>
        Balance:{' '}
        {typeof activePk?.balance?.amount === 'number'
          ? `${formatNumber(activePk?.balance?.amount)} Satoshis`
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
        <Button onClick={() => navigateTo(routes.SEND_BSV)}>Send BSV</Button>
        {/* <Button onClick={() => db.test()}>DB Test</Button> */}
        {/* <Button onClick={_getBalance}>Get balance</Button> */}
        <Button variant="success" onClick={_airdrop}>
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
