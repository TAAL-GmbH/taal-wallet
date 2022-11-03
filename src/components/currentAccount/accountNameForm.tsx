import { FC, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { updateAccountName } from '@/src/features/accountSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks';
import { sharedDb } from '../../db/shared';
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
  const [accountName, setAccountName] = useState(account.name);
  const { isLocked } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newAccountName = accountName.trim();
    setAccountName(newAccountName);

    // do not update if the name is the same
    if (newAccountName === account.name) {
      setIsFormVisible(false);
      return;
    }

    if (!newAccountName) {
      toast.error('Please input an account name');
      return;
    }

    if (isLocked) {
      toast.error('Please unlock your TAAL Wallet');
      return;
    }

    const accountList = await sharedDb.getAccountList();
    const existingAccount = accountList.find(item => item.name === newAccountName);

    if (existingAccount) {
      toast.error('Account name already exists');
      return;
    }

    setAccountName(newAccountName);

    dispatch(updateAccountName({ accountId: account.id, accountName }));
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
          autoFocus
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
