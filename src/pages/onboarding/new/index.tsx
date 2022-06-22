import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { HDPrivateKey, Mnemonic } from 'bsv';
import { Button } from '@/src/components/button';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { createToast } from '@/src/utils/toast';
import { FormTextArea } from '@/src/components/generic/form/formTextArea';
import { useForm } from '@/src/components/generic/form/useForm';
import { FormInput } from '@/src/components/generic/form/formInput';
import { PASSWORD_MIN_LENGTH } from '@/src/constants';
import { FormSelect } from '@/src/components/generic/form/formSelect';
import { networkList } from '@/src/constants/networkList';
import {
  createHDPrivateKey,
  derivePk,
  generateMnemonic,
} from '@/src/utils/blockchain';
import { store } from '@/src/store';
import {
  appendPK,
  setActivePk,
  setNetwork,
  setRootPK,
} from '@/src/features/pkSlice';
import { encrypt } from '@/src/utils/crypt';

type Props = {
  className?: string;
};

const defaultValues = {
  networkId: '',
  password: '',
  mnemonicPhrase: '',
};

export const OnboardingNew: FC<Props> = ({ className }) => {
  const mnemonic = useRef<Mnemonic>();
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );
  const { Form, methods } = useForm();

  useEffect(() => {
    mnemonic.current = generateMnemonic();
    methods.setValue('mnemonicPhrase', mnemonic.current.phrase);
  }, []);

  const onSubmit = ({
    networkId,
    password,
    mnemonicPhrase,
  }: typeof defaultValues) => {
    const toast = createToast('Creating Master Key...');

    if (!mnemonicPhrase) {
      toast.error('mnemonic is empty');
      return;
    }

    try {
      const network = networkList.find(item => item.id === networkId);

      const { pkInstance: masterKey } = createHDPrivateKey({
        networkId,
        password,
        mnemonic: mnemonic.current,
      });

      store.dispatch(
        setRootPK({
          privateKeyHash: masterKey.toString(),
          privateKeyEncrypted: encrypt(masterKey.toString(), password),
        })
      );
      store.dispatch(setNetwork(network));

      toast.success('Master Key created');
      createWallet(masterKey);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const createWallet = (masterKey: HDPrivateKey) => {
    const toast = createToast('Creating Wallet...');
    if (!masterKey) {
      toast.error('Please select a master key');
      return;
    }
    try {
      const childKey = derivePk({
        masterKey,
        path: "0'/0/0",
      });

      store.dispatch(appendPK(childKey));
      store.dispatch(setActivePk(childKey.address));

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
      <Form options={{ defaultValues }} data-test-id="" onSubmit={onSubmit}>
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
        <FormSelect
          label="Network"
          name="networkId"
          items={networkListOptions}
          options={{ required: 'Please select network' }}
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
