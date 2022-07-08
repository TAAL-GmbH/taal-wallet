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
import { LockIcon } from '../svg/lockIcon';
import { UnlockIcon } from '../svg/unlockIcon';

const defaultValues = {
  password: '',
};

export const Unlock: FC = () => {
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
