import { FC, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Button } from '@/components/generic/button';
import { useForm } from '@/components/generic/form/use-form';
import { FormInput } from '@/components/generic/form/form-input';
import { FormSelect } from '@/components/generic/form/form-select';
import { networkList } from '@/constants/network-list';
import { Row } from '@/components/generic/row';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';
import { clearState } from '@/features/onboarding-slice';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { db } from '@/db';
import { gap } from '@/utils/inject-spacing';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { FormTextArea } from '@/components/generic/form/form-text-area';
import { isBackgroundPageResponding } from '@/utils/communication';
import { FormCheckbox } from '@/components/generic/form/form-checkbox';
import { AnchorLink } from '@/components/anchor-link';
import { WalletIcon } from '@/svg/wallet-icon';
import { Chevron } from '@/components/svg/chevron';
import { EyeOffIcon } from '@/components/svg/eye-off-icon';
import { isValidMnemonic } from '@/utils/blockchain';
import type { CreateAccountReturnType } from '@/utils/account-factory';

export type FormSteps = 'selectRecoveryScheme' | 'validateRecoveryUserInput' | 'setNewAccountPassword';
type Props = {
  className?: string;
  step: FormSteps;
  walletType?: 'standard' | 'hidden';
};

export const RecoverAccountPage: FC<Props> = props => {
  const step = props.step;
  const accountList = useAppSelector(state => state.account.accountList);
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector(state => state.onboarding);
  const { Form } = useForm({ defaultValues: onboardingState, mode: 'onBlur' });
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );
  // const { getValues } = useFormContext<OnboardingState>();

  const isDev = process.env.NODE_ENV === 'development';
  const passwordMinLength = isDev ? 2 : parseInt(process.env.PASSWORD_MIN_LENGTH);
  const importAccount = async (formValues: typeof onboardingState) => {
    if (!(await isBackgroundPageResponding())) {
      console.error('background page is not responding');
      return navigateTo(routes.ERROR);
    }
    const result: CreateAccountReturnType = await chrome.runtime.sendMessage({
      action: 'bg:createAccount',
      payload: {
        ...formValues,
        action: 'importExisting',
      },
    });

    if (result.success === true) {
      // don't forget to switch database to new account
      await db.useAccount(result.data.accountId);
      toast.success('Account imported successfully');
      dispatch(clearState());
      navigateTo(routes.HOME);
    } else {
      toast.error(result?.error?.message || 'Error creating account');
    }
  };

  const onSubmit = async (formValues: typeof onboardingState) => {
    switch (step) {
      case 'setNewAccountPassword':
        return navigateTo(routes.RECOVER_ACCOUNT_STEP3);
      case 'validateRecoveryUserInput':
        return await importAccount(formValues);
      default:
        throw new Error('Invalid step');
    }
  };

  function FormControls() {
    const onBack = async () => {
      switch (step) {
        case 'setNewAccountPassword':
          return navigateTo(routes.RECOVER_ACCOUNT_STEP1);
        case 'validateRecoveryUserInput':
          return navigateTo(routes.RECOVER_ACCOUNT_STEP2);
        default:
          throw new Error('Invalid step');
      }
    };
    return (
      <ButtonWrapper>
        <Button variant="transparent" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary">
          Proceed
        </Button>
      </ButtonWrapper>
    );
  }

  const RecoverOptions = () => (
    <div>
      <Option href={`#${routes.RECOVER_ACCOUNT_STEP2}`}>
        <RecoverOptionCard>
          <IconContainer>
            <WalletIcon />
          </IconContainer>
          <div>
            <RecoverOptionTitle>Standard Security</RecoverOptionTitle>
            <RecoverOptionHint>No passphrase</RecoverOptionHint>
          </div>
        </RecoverOptionCard>
        <div>
          <Chevron direction="right" />
        </div>
      </Option>
      <Hr></Hr>
      <Option href={`#${routes.RECOVER_ACCOUNT_STEP2_HIDDEN}`}>
        <RecoverOptionCard>
          <IconContainer>
            <EyeOffIcon />
          </IconContainer>
          <div>
            <RecoverOptionTitle>Passphrase Security</RecoverOptionTitle>
            <RecoverOptionHint>Passphrase is required</RecoverOptionHint>
          </div>
        </RecoverOptionCard>
        <div>
          <Chevron direction="right" />
        </div>
      </Option>
    </div>
  );

  const SelectRecoveryScheme: FC = () => {

    return (
      <>
        <OnboardingHeading heading="Choose Wallet Type" progress={25} />
        <Row
          padding="0 md"
        >
          <RecoverOptions></RecoverOptions>
        </Row>
      </>
    )
  }

  const ValidateRecoveryInput: FC = () => {


    let heading = 'Recover or Import Standard Wallet';
    if (props.walletType === 'hidden') {
      heading = 'Recover or Import Hidden Wallet';
    }
    return (
      <>
        <OnboardingHeading heading={heading} progress={50} />
        <FormWrapper>
          <Form onSubmit={onSubmit}>
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
            <FormControls></FormControls>
          </Form>
        </FormWrapper>
      </>
    );
  }

  const SetAccountPassword: FC = () => (
    <>
      <OnboardingHeading heading="Set up a Password For Your Account" progress={100} />
      <FormWrapper>
        <Form onSubmit={onSubmit}>
          <Row>
            <FormInput
              label="Password"
              placeholder="Password"
              name="password"
              type="password"
              options={{
                required: 'Password is required',
                validate: value =>
                  value.length < passwordMinLength
                    ? `Password must be at least ${process.env.PASSWORD_MIN_LENGTH} characters length`
                    : true,
              }}
              required
            />
          </Row>
          <Row>
            <FormInput
              label="Confirm password"
              placeholder="Please confirm your password"
              name="password2"
              type="password"
              options={{
                required: 'Please confirm password',
                validateWithValues(value) {
                  // const values = getValues();
                  // return value === values?.password || "Passwords don't match";
                  return false
                },
              }}
              required
            />
          </Row>

          <Row margin="md 0">
            <FormCheckbox
              name="isTosAgreed"
              label={
                <>
                  I have read and agreed to the <AnchorLink href={routes.TOS}>Terms of use</AnchorLink>.
                </>
              }
              options={{
                required: 'Please agree to Terms of use',
              }}
            />
          </Row>
          <FormControls></FormControls>
        </Form>
      </FormWrapper>
    </>
  )
  switch (props.step) {
    case "selectRecoveryScheme":
      return <SelectRecoveryScheme></SelectRecoveryScheme>
    case "validateRecoveryUserInput":
      return <ValidateRecoveryInput></ValidateRecoveryInput>
    case "setNewAccountPassword":
      return <SetAccountPassword></SetAccountPassword>
    default:
      throw new Error('Invalid step');
  }
};

const Hr = styled.hr`
  border: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 1px;
  margin-top: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[300]};
`;

const FormWrapper = styled.div`
  max-width: 400px;
  width: 100%;
`;

const FormHint = styled.div`
  color: ${({ theme }) => theme.color.primary[600]}
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`;

const Option = styled.a`
  width: 100%;
  padding: 8px;
  height: 60px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
  }
  display: flex;
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;
  &:hover {
    background-color: ${({ theme }) => theme.color.primary[100]};
    text-decoration: none;
  }
`;

const RecoverOptionCard = styled.div`
  display: flex;
  align-items: center;
  ${gap`md`}
`;
const RecoverOptionHint = styled.div`
  color: ${({ theme }) => theme.color.grey[600]};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.4px;
`;
const RecoverOptionTitle = styled.div`
  color: ${({ theme }) => theme.color.grey[800]};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
  letter-spacing: -0.4px;
`;

const IconContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.primary[100]};
  justify-items: center;
  display: flex;
  svg {
    width: 20px;
    height: 20px;
    margin: auto;
    max-height: 20px;
    max-width: 20px;
  }
`;
