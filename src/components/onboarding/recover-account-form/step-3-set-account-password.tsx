import { AnchorLink } from "@/components/anchor-link";
import { FormCheckbox } from "@/components/generic/form/form-checkbox";
import { FormInput } from "@/components/generic/form/form-input";
import { Row } from "@/components/generic/row";
import { FC } from "react";
import { routes } from '@/constants/routes';
import type { OnboardingState } from '@/features/onboarding-slice';

export const SetAccountPassword: FC = (props: { passwordMinLength: number }) => {

  return (
    <>
      <FormInput
        label="Password"
        placeholder="Password"
        name="password"
        type="password"
        options={{
          required: 'Password is required',
          validate: value =>
            value.length < props.passwordMinLength
              ? `Password must be at least ${process.env.PASSWORD_MIN_LENGTH} characters length`
              : true,
        }}
        required
      />
      {/* <Row> */}

      {/* </Row> */}
      <Row>
        <FormInput
          label="Confirm password"
          placeholder="Please confirm your password"
          name="password2"
          type="password"
          options={{
            required: 'Please confirm password',
            validateWithValues(value, values: OnboardingState) {
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
  )
}
