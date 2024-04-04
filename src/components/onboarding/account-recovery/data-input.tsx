import { FC, useState } from 'react';
import styled from 'styled-components';

import { FormInput } from '@/components/generic/form/form-input';
import { FormSelect } from '@/components/generic/form/form-select';
import { FormTextArea } from '@/components/generic/form/form-text-area';
import { Row } from '@/components/generic/row';
import { networkList } from '@/constants/network-list';
import { useAppSelector } from '@/hooks/index';
import { isValidMnemonic } from '@/utils/blockchain';
import { margin } from '@/utils/inject-spacing';

type Props = {
  isWalletHidden?: boolean;
};

export const ValidateRecoveryInput: FC<Props> = ({ isWalletHidden }) => {
  const accountList = useAppSelector(state => state.account.accountList);
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );

  return (
    <>
      <Row>
        <FormInput
          label="Account name"
          placeholder="How would you call this account?"
          name="accountName"
          type="text"
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
        <FormSelect
          label="Network"
          name="networkId"
          items={networkListOptions}
          options={{ required: 'Please select network' }}
        />
      </Row>
      <Row>
        <FormTextArea
          label="Enter your recovery phrase"
          placeholder={Array.from({ length: 12 }, (_, i) => `word #${i + 1}`).join(' ')}
          name="mnemonicPhrase"
          rows={4}
          options={{
            required: 'Mnemonic phrase is required',
            validate: value => {
              const isValid = isValidMnemonic(value);
              if (!isValid) {
                return 'Invalid mnemonic phrase';
              }
              return true;
            },
          }}
          required
        />

        <FormHint>Paste or type your phrase in the right sequence</FormHint>
      </Row>

      {isWalletHidden && (
        <Row>
          <FormInput
            label="Passphrase"
            placeholder="Passphrase"
            name="passphrase"
            type="password"
            options={{
              required: 'Passphrase is required',
            }}
            required
          />
        </Row>
      )}
    </>
  );
};

const FormHint = styled.div`
  ${({ theme }) => theme.typography.body4};
  ${margin`0 0 lg`}
`;
