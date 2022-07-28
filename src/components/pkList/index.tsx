import { FC } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';
import { setActivePk } from '@/src/features/pkSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks';
import { navigateTo } from '@/src/utils/navigation';
import { Button } from '@/src/components/button';
import { PKType } from '@/src/types';
import { WalletPlusIcon } from '../svg/walletPlusIcon';
import { Li, Ul } from '@/components/generic/styled';
import { Heading } from '../generic/heading';
import { BackButton } from '../backButton';
import { CurrentAccount } from '../currentAccount';
import { WalletDetails } from '../walletDetails';

type Props = {
  className?: string;
};

export const PKList: FC<Props> = ({ className }) => {
  const { map } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();

  const setCurrentPK = (pk: PKType) => {
    dispatch(setActivePk(pk.address));
    history.back();
  };

  const list = Object.values(map).filter(item => item.path !== 'm');

  const deriveCta = (
    <ButtonStyled onClick={() => navigateTo(routes.DERIVE_PK)}>
      <WalletPlusIcon />
      Create a new wallet
    </ButtonStyled>
  );

  if (!list || !list.length) {
    return (
      <div>
        <h3>No wallets found</h3>
        {deriveCta}
      </div>
    );
  }

  return (
    <Wrapper className={className}>
      <CurrentAccount />
      <BackButton />
      <Heading icon={<WalletPlusIcon />}>Your wallets</Heading>

      {!list.length && (
        <div>
          <p>No wallets found.</p>
        </div>
      )}

      {deriveCta}

      {!!list.length && (
        <Ul>
          {list.map(item => (
            <Li key={item.address}>
              <WalletDetails data={item} />
              <Button size="sm" onClick={() => setCurrentPK(item)}>
                Select
              </Button>
            </Li>
          ))}
        </Ul>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const ButtonStyled = styled(Button)`
  width: 100%;
`;
