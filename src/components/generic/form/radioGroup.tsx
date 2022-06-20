import { injectSpacing } from '@/utils/injectSpacing';
import { FC, HTMLAttributes, ReactNode } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { FormFieldWrapper } from './formFieldWrapper';
import { FormInput } from './formInput';
import { FormInputError } from './formInputError';
import { Required } from './formStyled';

type Item = {
  label: string | ReactNode;
  value: string;
};

type Props = {
  className?: string;
  name: string;
  items: Item[];
  legend?: string | ReactNode;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown) => boolean | string;
  };
  margin?: string | boolean;
} & HTMLAttributes<HTMLFieldSetElement>;

type StyledProps = {
  padding?: string | boolean;
  hasError?: boolean;
};

export const RadioGroup: FC<Props> = ({
  className,
  name,
  legend,
  items,
  options,
  margin,
  ...rest
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const hasError = !!errors[name];

  return (
    <FormFieldWrapper data-test-id={`form-radio-group-${name}`} margin={margin}>
      <Fieldset
        className={className}
        padding="sm 0"
        hasError={hasError}
        {...rest}
      >
        {legend && (
          <Legend>
            {legend}
            {options?.required && <Required> *</Required>}
          </Legend>
        )}

        {items.map(item => {
          return (
            <FormInput
              key={item.value}
              name={name}
              type="radio"
              label={item.label}
              value={item.value}
              options={options}
              showError={false}
              showRequired={false}
            />
          );
        })}
      </Fieldset>
      <FormInputError name={name} errors={errors} />
    </FormFieldWrapper>
  );
};

const Fieldset = styled.fieldset<StyledProps>`
  border: 1px solid
    ${({ hasError }) => (hasError ? 'var(--errorColor)' : 'var(--borderColor)')};
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 -1rem 0.2rem;

  ${injectSpacing(['padding'])}
`;

const Legend = styled.legend`
  padding: 0 0.5rem;
  margin-left: 1rem;
  font-size: 0.9rem;
`;
