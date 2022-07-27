import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Mnemonic } from 'bsv';
import { Button } from '@/src/components/button';
import { FormTextArea } from '@/src/components/generic/form/formTextArea';
import { useForm } from '@/src/components/generic/form/useForm';
import { FormInput } from '@/src/components/generic/form/formInput';
import { FormSelect } from '@/src/components/generic/form/formSelect';
import { networkList } from '@/src/constants/networkList';
import { generateMnemonic } from '@/src/utils/blockchain';
import { Row } from '@/components/generic/row';
import { useAppSelector } from '@/src/hooks';
import { Note } from '../../generic/note';
import { InfoIcon } from '../../svg/infoIcon';
import { isBackgroundPageResponding } from '@/src/utils/communication';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';

type Props = {
  className?: string;
  action: 'importExisting' | 'createNew';
};

const defaultValues = {
  accountName: '',
  networkId: '',
  password: '',
  password2: '',
  mnemonicPhrase: '',
};

export const OnboardingForm: FC<Props> = ({ className, action }) => {
  const mnemonic = useRef<Mnemonic>();
  const { accountList } = useAppSelector(state => state.account);
  const { Form, methods } = useForm({ defaultValues, mode: 'onBlur' });
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );

  useEffect(() => {
    if (action === 'createNew') {
      mnemonic.current = generateMnemonic();
      methods.setValue('mnemonicPhrase', mnemonic.current.phrase);
    }
    isBackgroundPageResponding().then(result => console.log('isBackgroundPageResponding', result));
  }, [action]);

  const onSubmit = async ({ accountName, networkId, password, mnemonicPhrase }: typeof defaultValues) => {
    if (!(await isBackgroundPageResponding())) {
      return navigateTo(routes.ERROR);
    }
    const result = await chrome.runtime.sendMessage({
      action: 'bg:createAccount',
      payload: {
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        action,
      },
    });
    if (result.success) {
      toast.success('Account created successfully');
      navigateTo(routes.HOME);
    } else {
      toast.error(result?.error?.message || 'Error creating account');
    }
  };

  return (
    <FormWrapper>
      <Form data-test-id="" onSubmit={onSubmit} className={className}>
        <Row>
          <FormInput
            label="Account name"
            placeholder="How would you call this account?"
            name="accountName"
            type="text"
            size="sm"
            maxLength={20}
            options={{
              required: 'Account name is required',
              validate: value => {
                const existingAccount = accountList.find(
                  item => item.name.toLowerCase() === value.trim().toLowerCase()
                );
                if (existingAccount) {
                  return 'Account with this name already exists';
                }
              },
            }}
          />
        </Row>
        <Row>
          <FormInput
            label="Password"
            placeholder="Password is used to encrypt your wallet"
            name="password"
            type="password"
            size="sm"
            options={{
              required: 'Password is required',
              validate: value =>
                value.length < process.env.PASSWORD_MIN_LENGTH
                  ? `Password must be at least ${process.env.PASSWORD_MIN_LENGTH} characters length`
                  : true,
            }}
            required
          />
        </Row>
        <Row>
          <FormInput
            label="Repeat password"
            placeholder="Please repeat your password"
            name="password2"
            type="password"
            size="sm"
            options={{
              required: 'Please repeat password',
              validateWithValues(value, values: typeof defaultValues) {
                return value === values.password || "Passwords don't match";
              },
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
            label={'Secret phrase'}
            placeholder="Please input your 12 words secret phrase"
            readOnly={action === 'createNew'}
            options={{
              required: 'Secret phrase is required',
              validate: value =>
                value.trim().split(' ').length !== 12 ? 'Secret phrase must be 12 words' : true,
            }}
          />

          {action === 'createNew' && (
            <Note icon={<InfoIcon />} variant="warning" margin="sm 0 md" padding="sm md">
              The secret phrase is your 12 words seed phrase, it is important to keep it safe and without it
              you may lose access to your wallet and the funds in it.
            </Note>
          )}
        </Row>
        <Row>
          <Button type="submit" variant="primary">
            Next
          </Button>
        </Row>
      </Form>
    </FormWrapper>
  );
};

const FormWrapper = styled.div`
  max-width: 400px;
`;
