import { FC, useEffect, useRef, useState } from 'react';
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
import { Row } from '@/components/generic/row';
import { getHistory } from '@/src/features/wocApiSlice';
import { PKType } from '@/src/types';

type Props = {
  className?: string;
  action: 'importExisting' | 'createNew';
};

const defaultValues = {
  networkId: '',
  password: '',
  mnemonicPhrase: '',
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

  const onSubmit = async ({ networkId, password, mnemonicPhrase }: typeof defaultValues) => {
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

      let lastAddress: string;

      if (action === 'createNew') {
        const toast = createToast('Creating Wallet...');
        const newWallet = createWallet(rootKey);
        store.dispatch(appendPK(newWallet));
        lastAddress = newWallet.address;
        toast.success('Wallet created');
      } else {
        // Restoring wallets
        const toast = createToast('Restoring Wallets...');
        const walletList = await getWalletsWithHistory(rootKey);

        if (!walletList.length) {
          walletList.push(createWallet(rootKey));
        }

        walletList.forEach(wallet => store.dispatch(appendPK(wallet)));
        lastAddress = walletList[walletList.length - 1].address;
        toast.success(`${walletList.length} Wallet(s) restored`);
      }

      store.dispatch(setActivePk(lastAddress));

      navigateTo(routes.HOME);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getWalletsWithHistory = async (rootKey: HDPrivateKey): Promise<PKType[]> => {
    // TODO: this function fetches only first 20 wallets
    const walletList: PKType[] = [];

    for (let i = 0; i < 20; i++) {
      walletList.push(createWallet(rootKey, i));
    }

    const historyFetchResultList = await Promise.all(walletList.map(wallet => getHistory(wallet.address)));

    const addressWithHistoryList = historyFetchResultList
      .filter(({ data }) => data.length > 0)
      .map(({ originalArgs }) => originalArgs);

    return walletList.filter(({ address }) => addressWithHistoryList.includes(address));
  };

  const createWallet = (rootKey: HDPrivateKey, index = 0): PKType => {
    if (!rootKey) {
      throw new Error('rootKey is empty');
    }

    const { address, name, path } = derivePk({
      rootKey,
      path: `0'/0/${index}`,
    });

    return {
      address,
      name,
      path,
      balance: {
        amount: null,
        updatedAt: null,
      },
    };
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
