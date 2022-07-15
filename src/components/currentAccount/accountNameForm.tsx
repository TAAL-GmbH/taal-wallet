import { FC, FormEventHandler, useState } from 'react';
import { updateAccountName } from '@/src/features/accountSlice';
import { useAppSelector } from '@/src/hooks';
import { store } from '@/src/store';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { IconButton } from '../generic/icon-button';
import { CheckIcon } from '../svg/checkIcon';
import { EditIcon } from '../svg/editIcon';
import { AccountType } from '@/src/types';

type Props = {
  className?: string;
  account: AccountType;
};

export const AccountNameForm: FC<Props> = ({ className, account }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { isLocked } = useAppSelector(state => state.pk);
  const [accountName, setAccountName] = useState(account.name);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!accountName) {
      toast.error('Please input an account name');
      return;
    }
    if (isLocked) {
      toast.error('Please unlock your TAAL Wallet');
      return;
    }
    store.dispatch(updateAccountName({ accountId: account.id, accountName }));
    setIsFormVisible(false);

    toast.success('Account name updated successfully');
  };

  if (!isFormVisible) {
    return (
      <Wrapper>
        <div>
          <span onClick={() => !isLocked && setIsFormVisible(true)}>{account.name}</span>
          {!isLocked && (
            <IconButton onClick={() => setIsFormVisible(true)}>
              <EditIcon />
            </IconButton>
          )}
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={className}>
      <form onSubmit={onSubmit}>
        <Input
          type="text"
          onChange={e => setAccountName(e.target.value)}
          value={accountName}
          onKeyDown={e => e.key === 'Escape' && setIsFormVisible(false)}
          maxLength={20}
        />
        <SubmitButton type="submit">
          <CheckIcon />
        </SubmitButton>
      </form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  &,
  input {
    color: ${({ theme }) => theme.color.grey[600]};
  }

  > div,
  > form {
    font-size: 1.2rem;
    display: flex;
    gap: 0.2rem;
    height: 1.8rem;
    align-items: center;
  }

  svg {
    width: 1.2rem !important;
  }
`;

const Input = styled.input`
  font-size: 1.1rem;
  font-weight: normal;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.color.grey[200]};
  height: 1.8rem;
`;

const SubmitButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;
