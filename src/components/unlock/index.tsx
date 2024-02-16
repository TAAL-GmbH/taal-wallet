import { FC } from 'react';
import styled from 'styled-components';

import { db } from '@/db';
import { setRootPK } from '@/features/pk-slice';
import { decrypt } from '@/utils/crypt';
import { createToast } from '@/utils/toast';
import { useAppDispatch } from '@/hooks';

import { Form } from '@/generic/form/form';
import { FormInput } from '@/generic/form/form-input';
import { Button } from '@/generic/button';
import { SterileLayout } from '@/components/layout/sterile-layout';
import { ShieldLockIcon } from '@/svg/shield-lock-icon';
import { WalletLogo } from '@/svg/wallet-logo';
import { Row } from '@/generic/row';
import { margin } from '@/utils/inject-spacing';

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
      return;
    }

    try {
      const decrypted = await decrypt(privateKeyEncrypted, password);
      if (decrypted) {
        dispatch(setRootPK({ privateKeyHash: decrypted, privateKeyEncrypted }));
        // toast.success('Unlocked');
      }
    } catch (err) {
      const errorMap = {
        'unable to decrypt data': 'Incorrect password',
      };
      toast.error(errorMap[err.message] || err.message || 'Wrong password');
    }
  };

  return (
    <SterileLayout showBurgerMenu={false} center>
      <Row>
        <ShieldLockIcon />
      </Row>
      <Row>
        <WalletLogo />
      </Row>

      <Heading margin="xl 0 xxl">Unlock to continue</Heading>

      <FormStyled options={{ defaultValues, mode: 'onSubmit' }} onSubmit={onSubmit}>
        <Row>
          <FormInput
            name="password"
            label="Password"
            placeholder=""
            type="password"
            options={{
              required: 'Password is required',
            }}
            autoFocus
          />
        </Row>

        <Button type="submit" size="sm" variant="primary" width="100%">
          Unlock
        </Button>
      </FormStyled>
    </SterileLayout>
  );
};

const FormStyled = styled(Form)`
  width: 100%;
  ${margin`xxl 0`};
  box-sizing: border-box;
`;

const Heading = styled(Row)`
  ${({ theme }) => theme.typography.heading5};
`;
