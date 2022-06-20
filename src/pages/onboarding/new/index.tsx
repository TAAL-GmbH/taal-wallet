import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { HDPrivateKey, Mnemonic } from 'bsv';
import { Button } from '@/src/components/button';
import { injectSpacing } from '@/src/utils/injectSpacing';
import toast from 'react-hot-toast';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { createToast } from '@/src/utils/toast';
import { useAppSelector } from '@/src/hooks';
import { db } from '@/src/db';
import { FormTextArea } from '@/src/components/generic/form/formTextArea';
import { useForm } from '@/src/components/generic/form/useForm';
import { FormInput } from '@/src/components/generic/form/formInput';
import { PASSWORD_MIN_LENGTH } from '@/src/constants';

type Props = {
  className?: string;
};

const defaultValues = { password: '', mnemonicPhrase: '' };

export const OnboardingNew: FC<Props> = ({ className }) => {
  const mnemonic = useRef<Mnemonic>();
  const { Form, methods } = useForm();

  useEffect(() => {
    mnemonic.current = pk.generateMnemonic();
    methods.setValue('mnemonicPhrase', pk.generateMnemonic().phrase);
  }, []);

  const createHDPK = ({ password, mnemonicPhrase }: typeof defaultValues) => {
    const toast = createToast('Creating Master Key...');
    if (!mnemonicPhrase) {
      toast.error('mnemonic is empty');
      return;
    }
    try {
      const { pkInstance: masterKey } = pk.createHDPrivateKey({
        mnemonic: mnemonic.current,
        password,
      });

      toast.success('Master Key created');
      createWallet(masterKey);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const createWallet = (masterKey: HDPrivateKey) => {
    console.log('createWallet', { masterKey });
    const toast = createToast('Creating Wallet...');
    if (!masterKey) {
      toast.error('Please select a master key');
      return;
    }
    try {
      const wallet = pk.derive({
        masterKey,
        network: masterKey.network.name,
        path: "0'/0/0",
      });
      toast.success('Wallet created');
      navigateTo(routes.HOME);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Wrapper className={className}>
      <h1>Create a new Wallet</h1>
      <p>
        These are your 12 words, copy them and store them in a secure place:
      </p>
      <Form options={{ defaultValues }} data-test-id="" onSubmit={createHDPK}>
        <FormInput
          label="Password"
          placeholder="Password is used to encrypt your wallet"
          name="password"
          type="password"
          options={{
            validate: value =>
              value.length < PASSWORD_MIN_LENGTH
                ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters length`
                : true,
          }}
          required
        />
        <FormTextArea
          name="mnemonicPhrase"
          padding="md"
          margin="0 0 md 0"
          readOnly
        />
        <Button type="submit" variant="primary">
          Next
        </Button>

        {/* <Button onClick={createWallet} variant="primary">
        Create a Wallet
      </Button> */}
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 80px;
  border: 1px solid ${({ theme }) => theme.color.grey[100]};

  ${injectSpacing(['margin', 'padding'])}
`;
