import { FC } from 'react';
import styled from 'styled-components';
import { db } from '@/src/db';
import { setRootPK } from '@/src/features/pkSlice';
import { decrypt } from '@/src/utils/crypt';
import { createToast } from '@/src/utils/toast';
import { Button } from '../button';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { Heading } from '../generic/heading';
import { LockIcon } from '../svg/lockIcon';
import { UnlockIcon } from '../svg/unlockIcon';
import { useAppDispatch } from '@/src/hooks';

const defaultValues = {
  password: '',
};

export const Unlock: FC = () => {
  const dispatch = useAppDispatch();

  const onSubmit = async ({ password }: typeof defaultValues) => {
    const toast = createToast('Unlocking...');
    const privateKeyEncrypted = await db.getKeyVal('rootPk.privateKeyEncrypted');

    if (!privateKeyEncrypted) {
      toast.error('No private key found');
    }

    try {
      const decrypted = decrypt(privateKeyEncrypted, password);
      dispatch(setRootPK({ privateKeyHash: decrypted, privateKeyEncrypted }));

      if (decrypted) {
        toast.success('Unlocked');
      }
    } catch (err) {
      // TODO: create error messages map
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
            required: 'Password is required',
          }}
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
