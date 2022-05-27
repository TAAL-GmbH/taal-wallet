import { FC } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';
import { setActivePk } from '@/src/features/pkSlice';
import { useAppSelector } from '@/src/hooks';
import { navigateTo } from '@/src/utils/navigation';
import { Button } from '@/src/components/button';
import { store } from '@/src/store';
import { PKType } from '@/src/types';

type Props = {
  className?: string;
};

export const PKList: FC<Props> = ({ className }) => {
  const { list } = useAppSelector(state => state.pk);

  const setCurrentPK = (pk: PKType) => {
    store.dispatch(setActivePk(pk));
    navigateTo(routes.HOME);
  };

  return (
    <Wrapper className={className}>
      <h2>Private keys</h2>

      {!list.length && (
        <div>
          <p>No Private keys found.</p>
        </div>
      )}

      {!!list.length && (
        <Ul>
          {list.map(item => (
            <Li
              key={item.address}
              role="button"
              onClick={() => setCurrentPK(item)}
            >
              <Dl>
                <dt>Address:</dt>
                <dd>{item.address}</dd>
                <dt>PK:</dt>
                <dd>{item.pk.slice(0, 15)}...</dd>
                <dt>Balance:</dt>
                <dd>
                  {Number.isInteger(item.balance)
                    ? item.balance?.toLocaleString()
                    : 'unknown'}
                </dd>
              </Dl>
            </Li>
          ))}
        </Ul>
      )}

      <ButtonStyled onClick={() => navigateTo(routes.CREATE_PK)}>
        Create new Private key
      </ButtonStyled>
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
  }

  dd {
    overflow: auto;
    margin: 0;
  }
`;

const ButtonStyled = styled(Button)`
  width: 100%;
`;
