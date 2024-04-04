import { FC, useState } from 'react';
import { Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import { SterileLayout } from '@/components/layout/sterile-layout';
import { routes } from '@/constants/routes';
import { CreateAccountForm } from '@/components/onboarding/create-account-form';
import { useAppSelector } from '@/hooks';
import { getLocationPath, navigateTo } from '@/utils/navigation';
import { TosAgreement } from '@/components/tos-agreement';
import { Spinner } from '@/components/spinner';
import { AccountRecovery } from '@/components/onboarding/account-recovery';

import { OnboardingLanding } from './onboarding-landing';
import { BackupTips } from './backup-tips';
import { ValidateAndCreate } from './validate-and-create';
import { DisplayMnemonic } from './display-mnemonic';

type Props = {
  isInitial?: boolean;
};

export const Onboarding: FC<Props> = ({ isInitial }) => {
  const onboardingState = useAppSelector(state => state.onboarding);
  const locationPath = getLocationPath();
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string | null>(null);

  const nonStateValidatedRoutes = [
    routes.HOME,
    routes.TOS,
    routes.ONBOARDING,
    routes.CREATE_ACCOUNT,
    routes.ONBOARDING_IMPORT,
  ];

  // run validation only for account creation steps and not for recovery
  if (!locationPath.startsWith(routes.RECOVER_ACCOUNT) && !nonStateValidatedRoutes.includes(locationPath)) {
    const isValidState = Object.values(onboardingState).every(item => !!item);
    if (!isValidState) {
      navigateTo(routes.ONBOARDING);
      return null;
    }
  }

  return (
    <SterileLayout showTopHeader={false} showBackButton={!isInitial} center>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path={routes.CREATE_ACCOUNT}>
            <CreateAccountForm />
          </Route>
          <Route path={routes.TOS}>
            <TosAgreement />
          </Route>
          <Route path={routes.BACKUP_TIPS}>
            <BackupTips />
          </Route>
          <Route path={routes.DISPLAY_MNEMONIC}>
            <DisplayMnemonic mnemonicPhrase={mnemonicPhrase} setMnemonicPhrase={setMnemonicPhrase} />
          </Route>
          <Route path={routes.VALIDATE_AND_CREATE}>
            {mnemonicPhrase ? <ValidateAndCreate mnemonicPhrase={mnemonicPhrase} /> : <Spinner />}
          </Route>

          <Route path={routes.ONBOARDING_IMPORT}>
            <CreateAccountForm />
          </Route>

          <Route path={`${routes.RECOVER_ACCOUNT}/:stepName?/:extra?`}>
            <AccountRecovery />
          </Route>

          <Route>
            <OnboardingLanding isInitial={isInitial} />
          </Route>
        </Switch>
      </Router>
    </SterileLayout>
  );
};
