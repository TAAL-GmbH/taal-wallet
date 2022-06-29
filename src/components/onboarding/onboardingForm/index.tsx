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
import { createHDPrivateKey, derivePk, generateMnemonic, rebuildMnemonic } from '@/src/utils/blockchain';
import { store } from '@/src/store';
import { appendPK, setActivePk, setNetwork, setRootPK } from '@/src/features/pkSlice';
import { encrypt } from '@/src/utils/crypt';
import { Row } from '../../generic/row';

type Props = {
  className?: string;
  action: 'importExisting' | 'createNew';
};

const defaultValues = {
  networkId: '',
  password: '',
  mnemonicPhrase: 'seek they close gun alpha field aspect cram jaguar cycle oven march',
};

export const OnboardingForm: FC<Props> = ({ className, action }) => {
  const mnemonic = useRef<Mnemonic>();
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );
  const { Form, methods } = useForm({ defaultValues });

  useEffect(() => {
    if (action === 'createNew') {
      mnemonic.current = generateMnemonic();
      methods.setValue('mnemonicPhrase', mnemonic.current.phrase);
    }
  }, [action]);

  const onSubmit = ({ networkId, password, mnemonicPhrase }: typeof defaultValues) => {
    const toast = createToast('Creating Root Key...');

    if (!mnemonicPhrase) {
      toast.error('mnemonic is empty');
      return;
    }

    try {
      const network = networkList.find(item => item.id === networkId);

      const { pkInstance: rootKey } = createHDPrivateKey({
        networkId,
        password,
        mnemonic: action === 'createNew' ? mnemonic.current : rebuildMnemonic(mnemonicPhrase),
      });

      store.dispatch(
        setRootPK({
          privateKeyHash: rootKey.toString(),
          privateKeyEncrypted: encrypt(rootKey.toString(), password),
        })
      );
      store.dispatch(setNetwork(network));

      toast.success('Root Key created');
      createWallet(rootKey);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const createWallet = (rootKey: HDPrivateKey) => {
    const toast = createToast('Creating Wallet...');
    if (!rootKey) {
      toast.error('Please select a root key');
      return;
    }
    try {
      const { address, name, path } = derivePk({
        rootKey,
        path: "0'/0/0",
      });

      store.dispatch(
        appendPK({
          address,
          name,
          path,
          balance: {
            amount: null,
            updatedAt: null,
          },
        })
      );
      store.dispatch(setActivePk(address));

      toast.success('Wallet created');
      navigateTo(routes.HOME);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Form data-test-id="" onSubmit={onSubmit} className={className}>
      <Row>
        <FormInput
          label="Password"
          placeholder="Password is used to encrypt your wallet"
          name="password"
          type="password"
          size="sm"
          options={{
            validate: value =>
              value.length < PASSWORD_MIN_LENGTH
                ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters length`
                : true,
          }}
          required
        />
      </Row>
      <Row>
        <FormSelect
          label="Network"
          name="networkId"
          items={networkListOptions}
          size="sm"
          options={{ required: 'Please select network' }}
        />
      </Row>
      {/* <p>These are your 12 words, copy them and store them in a secure place:</p> */}

      <Row>
        <FormTextArea
          name="mnemonicPhrase"
          padding="md"
          margin="0"
          size="sm"
          rows={3}
          label={
            action === 'createNew'
              ? 'These are your 12 words, copy them and store them in a secure place:'
              : 'Mnemonic phrase'
          }
          placeholder="Please input your 12 words mnemonic phrase"
          readOnly={action === 'createNew'}
          options={{
            validate: value => (value.split(' ').length !== 12 ? 'Mnemonic phrase must be 12 words' : true),
          }}
        />
      </Row>
      <Row>
        <Button type="submit" variant="primary">
          Next
        </Button>
      </Row>
    </Form>
  );
};

const Wrapper = styled.div`
  //
`;
