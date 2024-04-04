import { FC, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Redirect, Route, Router, Switch, useParams } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import { Button } from '@/components/generic/button';
import { useForm } from '@/components/generic/form/use-form';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';
import { clearState } from '@/features/onboarding-slice';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { db } from '@/db';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { isBackgroundPageResponding } from '@/utils/communication';
import type { CreateAccountReturnType } from '@/utils/account-factory';
import { useAppDispatch } from '@/hooks/index';
import { networkList } from '@/constants/network-list';

import { SelectRecoveryScheme } from './select-recovery-scheme';
import { ValidateRecoveryInput } from './data-input';
import { AccountPassword } from './account-password';

export enum RecoveryStepName {
  SECURITY = 'security',
  DATA_COLLECTION = 'data-collection',
  PASSWORD = 'password',
}

export type RecoveryState = {
  networkId: typeof networkList[number] | null;
  accountName: string;
  mnemonicPhrase: string;
  password: string;
  password2: string;
  passphrase: string;
};

export const initialRecoveryState: RecoveryState = {
  networkId: null,
  accountName: '',
  mnemonicPhrase: '',
  password: '',
  password2: '',
  passphrase: '',
};

export const AccountRecovery: FC = () => {
  const dispatch = useAppDispatch();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>(initialRecoveryState);
  const { stepName, extra } = useParams<{ stepName?: string; extra?: string }>();
  const { Form } = useForm({ defaultValues: recoveryState, mode: 'onBlur' });

  const importAccount = async () => {
    if (!(await isBackgroundPageResponding())) {
      console.error('background page is not responding');
      return navigateTo(routes.ERROR);
    }
    const { accountName, networkId, password, passphrase, mnemonicPhrase } = recoveryState;
    const result: CreateAccountReturnType = await chrome.runtime.sendMessage({
      action: 'bg:createAccount',
      payload: {
        accountName,
        networkId,
        password,
        mnemonicPhrase,
        passphrase,
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

  const onChange = (formValues: RecoveryState) => {
    setRecoveryState(current => ({ ...current, ...formValues }));
  };

  const onSubmit = async (formValues: RecoveryState) => {
    switch (stepName) {
      case RecoveryStepName.DATA_COLLECTION:
        return navigateTo(routes.RECOVER_ACCOUNT_PASSWORD);
      case RecoveryStepName.PASSWORD:
        return await importAccount();
    }
  };

  const onBack = async () => {
    switch (stepName) {
      case RecoveryStepName.DATA_COLLECTION:
        return navigateTo(routes.RECOVER_ACCOUNT_SECURITY);
      case RecoveryStepName.PASSWORD:
        return navigateTo(routes.RECOVER_ACCOUNT_DATA_COLLECTION);
    }
  };

  // check if state is valid
  // this could happen on page refresh or direct link
  if (stepName === RecoveryStepName.PASSWORD) {
    const isIncompleteState = [
      recoveryState.accountName,
      recoveryState.networkId,
      recoveryState.mnemonicPhrase,
    ].some(item => !item);
    if (isIncompleteState) {
      navigateTo(routes.RECOVER_ACCOUNT_DATA_COLLECTION);
      return;
    }
  }

  let heading = '';
  let progress = 0;

  switch (stepName) {
    case RecoveryStepName.SECURITY:
      heading = 'Choose Wallet Type';
      progress = 25;
      break;
    case RecoveryStepName.DATA_COLLECTION:
      heading = extra === 'hidden' ? 'Recover or Import Hidden Wallet' : 'Recover or Import Standard Wallet';
      progress = 50;
      break;
    case RecoveryStepName.PASSWORD:
      heading = 'Set up a Password For Your Account';
      progress = 100;
      break;
  }

  return (
    <>
      <OnboardingHeading heading={heading} progress={progress} />

      <FormWrapper>
        <Form onSubmit={onSubmit} onChange={onChange}>
          <Router hook={useHashLocation}>
            <Switch>
              <Route path={routes.RECOVER_ACCOUNT_SECURITY}>
                <SelectRecoveryScheme />
              </Route>

              <Route path={routes.RECOVER_ACCOUNT_DATA_COLLECTION}>
                <ValidateRecoveryInput />
              </Route>

              <Route path={routes.RECOVER_ACCOUNT_DATA_COLLECTION_HIDDEN}>
                <ValidateRecoveryInput isWalletHidden />
              </Route>

              <Route path={routes.RECOVER_ACCOUNT_PASSWORD}>
                <AccountPassword />
              </Route>

              <Route path="*">
                <Redirect to={routes.RECOVER_ACCOUNT_SECURITY} />
              </Route>
            </Switch>
          </Router>

          {stepName !== RecoveryStepName.SECURITY && (
            <ButtonWrapper>
              <Button variant="transparent" onClick={onBack}>
                Back
              </Button>
              <Button type="submit" variant="primary">
                Proceed
              </Button>
            </ButtonWrapper>
          )}
        </Form>
      </FormWrapper>
    </>
  );
};

const FormWrapper = styled.div`
  max-width: 400px;
  width: 100%;
`;
