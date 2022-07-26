import { setIsCreating } from '@/src/features/accountSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Button } from '../button';
import { PageLoading } from '../loadingPage';

export const AccountCreationStatus: FC = () => {
  const { creation, eventList } = useAppSelector(state => state.account);
  const dispatch = useAppDispatch();

  if (!creation.isCreating) {
    return null;
  }

  const onClose = () => {
    dispatch(setIsCreating(false));
  };

  const isError = eventList.some(event => event.type === 'error');

  return (
    <PageLoading>
      {isError && <Error>Error occurred. Please try again.</Error>}

      <Ul>
        {eventList
          .filter(item => item.showToUser)
          .map(({ type, message }) => (
            <Li key={message} type={type}>
              {message}
            </Li>
          ))}
        {creation.isHistoryFetching && (
          <>
            {!!creation.restoredWalletsCount && <Li>Restored {creation.restoredWalletsCount} wallet(s)</Li>}
            <Li>Fetching history for wallet #{creation.derivationPathLastIndex}</Li>
          </>
        )}
      </Ul>

      {isError && <Button onClick={onClose}>Close</Button>}
    </PageLoading>
  );
};

const Ul = styled.ul`
  margin-bottom: 1rem;
`;
const Li = styled.li<{ type?: string }>`
  ${({ type }) => {
    switch (type) {
      case 'error':
        return css`
          color: ${({ theme }) => theme.color.danger[400]};
        `;
      case 'success':
        return css`
          color: ${({ theme }) => theme.color.success[400]};
        `;
      default:
        return css`
          color: ${({ theme }) => theme.color.grey[500]};
        `;
    }
  }}
`;

const Error = styled.div`
  color: ${({ theme }) => theme.color.danger[400]};
  font-size: 1.1rem;
  font-weight: bold;
  margin: 1rem 0;

  > div {
    margin-bottom: 1rem;
  }
`;
