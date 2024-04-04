import { FC, useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/generic/button';
import { useForm } from '@/components/generic/form/use-form';
import { FormInput } from '@/components/generic/form/form-input';
import { FormSelect } from '@/components/generic/form/form-select';
import { networkList } from '@/constants/network-list';
import { Row } from '@/components/generic/row';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';
import { setState } from '@/features/onboarding-slice';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { FormCheckbox } from '@/components/generic/form/form-checkbox';
import { AnchorLink } from '@/components/anchor-link';

export const CreateAccountForm: FC = () => {
  const accountList = useAppSelector(state => state.account.accountList);
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector(state => state.onboarding);
  const { Form } = useForm({ defaultValues: onboardingState, mode: 'onBlur' });
  const [networkListOptions] = useState(
    [{ label: 'Select network', value: '' }].concat(
      networkList.map(({ label, id }) => ({ label, value: id }))
    )
  );

  const isDev = process.env.NODE_ENV === 'development';
  const passwordMinLength = isDev ? 2 : parseInt(process.env.PASSWORD_MIN_LENGTH);

  const onSubmit = async (formValues: typeof onboardingState) => {
    dispatch(setState(formValues));
    navigateTo(routes.BACKUP_TIPS);
  };

  return (
    <>
      <OnboardingHeading heading="Create a new account" progress={25} />
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
            <FormInput
              label="Password"
              placeholder="Password"
              name="password"
              type="password"
              options={{
                required: 'Password is required',
                validate: value =>
                  value.length < passwordMinLength
                    ? `Password must be at least ${passwordMinLength} characters length`
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
              options={{
                required: 'Please repeat password',
                validateWithValues(value, values: typeof onboardingState) {
                  return value === values.password || "Passwords don't match";
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

          <ButtonWrapper>
            <Button variant="transparent" onClick={() => navigateTo(routes.ONBOARDING)}>
              Back
            </Button>
            <Button type="submit" variant="primary">
              Proceed
            </Button>
          </ButtonWrapper>
        </Form>
      </FormWrapper>
    </>
  );
};

const FormWrapper = styled.div`
  max-width: 400px;
  width: 100%;
`;
