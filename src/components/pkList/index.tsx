import { FC } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';
import { setActivePk } from '@/src/features/pkSlice';
import { useAppSelector } from '@/src/hooks';
import { navigateTo } from '@/src/utils/navigation';
import { Button } from '@/src/components/button';
import { store } from '@/src/store';
import { PKType } from '@/src/types';
import dayjs from 'dayjs';
import { WalletPlusIcon } from '../svg/walletPlusIcon';

type Props = {
  className?: string;
};

export const PKList: FC<Props> = ({ className }) => {
  const { map } = useAppSelector(state => state.pk);

  const setCurrentPK = (pk: PKType) => {
    store.dispatch(setActivePk(pk.address));
    history.back();
  };

  const list = Object.values(map).filter(item => item.path !== 'm');

  const deriveCta = (
    <ButtonStyled onClick={() => navigateTo(routes.DERIVE_PK)}>
      <WalletPlusIcon />
      Create a new Wallet
    </ButtonStyled>
  );

  if (!list || !list.length) {
    return (
      <div>
        <h3>No Wallets found</h3>
        {deriveCta}
      </div>
    );
  }

  return (
    <Wrapper className={className}>
      <h1>Your Wallets</h1>

      {!list.length && (
        <div>
          <p>No Wallets found.</p>
        </div>
      )}

      {deriveCta}

      {!!list.length && (
        <Ul>
          {list.map(item => (
            <Li key={item.address} role="button" onClick={() => setCurrentPK(item)}>
              <Dl>
                <dt>Name:</dt>
                <dd>{item.name}</dd>
                <dt>Address:</dt>
                <dd>{item.address}</dd>
                <dt>Path:</dt>
                <dd>{item.path}</dd>
                <dt>Balance:</dt>
                <dd>
                  {Number.isInteger(item.balance.amount)
                    ? `${item.balance.amount?.toLocaleString()} satoshis`
                    : 'unknown'}
                </dd>
                {item.balance.updatedAt && (
                  <>
                    <dt>Updated:</dt>
                    <dd>{dayjs(item.balance.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</dd>
                  </>
                )}
              </Dl>
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

const Ul = styled.ul`
  list-style: none;
  margin: 1rem 0;
  padding: 0;
  cursor: pointer;
  border-top: 1px double ${({ theme }) => theme.color.grey[200]};

  li + li {
    &::before {
      display: block;
      margin: 0 -1rem;
      content: ' ';
      border-top: 1px solid #ccc;
    }
  }
`;

const Li = styled.li`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 0.5rem;

  &:hover {
    background-color: ${({ theme }) => theme.color.grey[100]};
    color: ${({ theme }) => theme.color.grey[700]};
  }
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: min-content auto;
  flex-direction: column;
  gap: 0.2rem 0.5rem;
  width: 100%;

  dt {
    font-weight: bold;
    white-space: nowrap;
  }

  dd {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0;
  }
`;

const ButtonStyled = styled(Button)`
  width: 100%;
`;
