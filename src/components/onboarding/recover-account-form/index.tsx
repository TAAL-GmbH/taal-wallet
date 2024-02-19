import { FC } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Button } from '@/components/generic/button';
import { useForm } from '@/components/generic/form/use-form';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';
import { OnboardingState, clearState } from '@/features/onboarding-slice';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { db } from '@/db';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { isBackgroundPageResponding } from '@/utils/communication';
import type { CreateAccountReturnType } from '@/utils/account-factory';
import { SelectRecoveryScheme } from './step-1-select-recovery-scheme';
import { ValidateRecoveryInput } from './ValidateRecoveryInput';
import { SetAccountPassword } from './step-3-set-account-password';

export type FormSteps = 'step_1_selectRecoveryScheme' | 'step_2_validateRecoveryUserInput' | 'step_3_setNewAccountPassword';
export type Props = {
  className?: string;
  step: FormSteps;
  walletType?: 'standard' | 'hidden';
};

export const RecoverAccountPage: FC<Props> = props => {
  const step = props.step;
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector(state => state.onboarding);
  const { Form, methods } = useForm({ defaultValues: onboardingState, mode: 'onBlur' });

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
      case 'step_2_validateRecoveryUserInput':
        return navigateTo(routes.RECOVER_ACCOUNT_STEP3);
      case 'step_3_setNewAccountPassword':
        return await importAccount(formValues);
      default:
        throw new Error('Invalid step');
    }
  };
  const onBack = async () => {
    switch (step) {
      case 'step_2_validateRecoveryUserInput':
        return navigateTo(routes.RECOVER_ACCOUNT_STEP1);
      case 'step_3_setNewAccountPassword':
        return navigateTo(routes.RECOVER_ACCOUNT_STEP2);
      default:
        throw new Error('Invalid step');
    }
  };

  return <>
    <FormWrapper>
      <Form onSubmit={onSubmit}>
        {(() => {
          switch (step) {
            case 'step_1_selectRecoveryScheme':
              return <>
                <OnboardingHeading heading="Choose Wallet Type" progress={25} />
                <SelectRecoveryScheme></SelectRecoveryScheme>
              </>
            case 'step_2_validateRecoveryUserInput': {
              let heading = 'Recover or Import Standard Wallet';
              if (props.walletType === 'hidden') {
                heading = 'Recover or Import Hidden Wallet';
              }
              return <>
                <OnboardingHeading heading={heading} progress={50} />
                <ValidateRecoveryInput walletType={props.walletType} ></ValidateRecoveryInput>
                <FormControl onBack={onBack}></FormControl>

              </>
            }
            case 'step_3_setNewAccountPassword':
              return <>
                <OnboardingHeading heading="Set up a Password For Your Account" progress={100} />
                <SetAccountPassword></SetAccountPassword>
                <FormControl onBack={onBack}></FormControl>
              </>
            default:
              throw new Error('Invalid step');
          }
        })()}
      </Form>
    </FormWrapper>
  </>


};
function FormControl(props: { onBack: () => void }) {

  return <ButtonWrapper>
    <Button variant="transparent" onClick={props.onBack}>
      Back
    </Button>
    <Button type="submit" variant="primary">
      Proceed
    </Button>
  </ButtonWrapper>
}

const FormWrapper = styled.div`
  max-width: 400px;
  width: 100%;
`;

