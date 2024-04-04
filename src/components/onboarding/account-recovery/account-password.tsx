import { FC } from 'react';

import { AnchorLink } from '@/components/anchor-link';
import { FormCheckbox } from '@/components/generic/form/form-checkbox';
import { FormInput } from '@/components/generic/form/form-input';
import { Row } from '@/components/generic/row';
import { routes } from '@/constants/routes';

import type { RecoveryState } from './index';

const isDev = process.env.NODE_ENV === 'development';
const passwordMinLength = isDev ? 2 : parseInt(process.env.PASSWORD_MIN_LENGTH);

export const AccountPassword: FC = () => {
  return (
    <>
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
          label="Confirm password"
          placeholder="Please confirm your password"
          name="password2"
          type="password"
          options={{
            required: 'Please confirm password',
            validateWithValues(value, values: RecoveryState) {
              return value === values?.password || "Passwords don't match";
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
    </>
  );
};
