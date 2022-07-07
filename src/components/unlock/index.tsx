import { PASSWORD_MIN_LENGTH } from '@/src/constants';
import { db } from '@/src/db';
import { setRootPK } from '@/src/features/pkSlice';
import { useAppSelector } from '@/src/hooks';
import { store } from '@/src/store';
import { decrypt } from '@/src/utils/crypt';
import { createToast } from '@/src/utils/toast';
import { FC } from 'react';
import styled from 'styled-components';
import { Button } from '../button';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { Heading } from '../generic/heading';
import { NetworkPill } from '../networkPill';
import { AccountIcon } from '../svg/accountIcon';
import { LockIcon } from '../svg/lockIcon';
import { UnlockIcon } from '../svg/unlockIcon';

const defaultValues = {
  password: '',
};

export const Unlock: FC = () => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);

  const onSubmit = async ({ password }: typeof defaultValues) => {
    const toast = createToast('Unlocking...');
    const privateKeyEncrypted = await db.getKeyVal('rootPk.privateKeyEncrypted');

    if (!privateKeyEncrypted) {
      toast.error('No private key found');
    }

    try {
      const decrypted = decrypt(privateKeyEncrypted, password);
      store.dispatch(setRootPK({ privateKeyHash: decrypted, privateKeyEncrypted }));

      if (decrypted) {
        toast.success('Unlocked');
      }
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  };

  return (
    <Wrapper>
      <Heading icon={<LockIcon />}>Your account is locked</Heading>

      <CurrentAccount>
        <AccountIconBox>
          <AccountIcon />
          <NetworkPill>{accountMap[activeAccountId].networkId}</NetworkPill>
        </AccountIconBox>
        <AccountName>
          <small>Current account: </small>
          {accountMap[activeAccountId].name}
        </AccountName>
      </CurrentAccount>

      <Form options={{ defaultValues }} onSubmit={onSubmit} data-test-id="">
        <FormInput
          name="password"
          label="Enter password to unlock your wallet"
          placeholder="Enter password"
          type="password"
          options={{
            validate: value =>
              value.length < PASSWORD_MIN_LENGTH
                ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters length`
                : true,
          }}
          required
          autoFocus
        />
        <Button type="submit">
          <UnlockIcon />
          Unlock
        </Button>
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const CurrentAccount = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  margin: 1rem 0;
  border: 1px solid ${({ theme }) => theme.color.neutral[500]};
  background-color: ${({ theme }) => theme.color.neutral[100]};
`;

const AccountIconBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 2rem;
    height: 2rem;
    margin: 0.5rem 0.2rem;
  }

  span {
    position: absolute;
    top: 1.8rem;
  }
`;

const AccountName = styled.div`
  font-size: 1.2rem;
  margin-top: 0.5rem;

  small {
    font-size: 0.8rem;
    display: block;
  }
`;
