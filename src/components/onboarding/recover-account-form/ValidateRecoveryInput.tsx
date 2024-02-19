import { FormInput } from "@/components/generic/form/form-input";
import { FormSelect } from "@/components/generic/form/form-select";
import { FormTextArea } from "@/components/generic/form/form-text-area";
import { Row } from "@/components/generic/row";
import { networkList } from "@/constants/network-list";
import { useAppSelector } from "@/hooks/index";
import { isValidMnemonic } from "@/utils/blockchain";
import { FC, useState } from "react";
import styled from 'styled-components';
import type { Props } from "./index";


const FormHint = styled.div`
  color: ${({ theme }) => theme.color.primary[600]}
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`;
const isDev = process.env.NODE_ENV === 'development';


export const ValidateRecoveryInput: FC<{ walletType: Props["walletType"] }> = (props) => {
  const accountList = useAppSelector(state => state.account.accountList);
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );
  const passwordMinLength = isDev ? 2 : parseInt(process.env.PASSWORD_MIN_LENGTH);
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
          placeholder="word #1, word #2, word #3, word #4, word #5,word #6, word #7, word #8, word #9, word #10, word #11, word #12"
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
      {props.walletType === 'hidden' && (
        <Row>
          <FormInput
            label="Passphrase"
            placeholder="Passphrase"
            name="passphrase"
            type="password"
            options={{
              required: 'Passphrase is required',
              validate: value =>
                value.length < passwordMinLength
                  ? `Passphrase must be at least ${passwordMinLength} characters length`
                  : true,
            }}
            required
          />
        </Row>
      )}
    </>
  );
}


