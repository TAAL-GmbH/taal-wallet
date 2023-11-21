import { FC, InputHTMLAttributes, ReactElement, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import { CloseIcon } from '@/components/svg/close-icon';
import { VisibilityIcon } from '@/svg/visibility-icon';

import { FormInputError } from './form-input-error';
import { FormInputLabel } from './form-input-label';
import { FormFieldWrapper } from './form-field-wrapper';
import {
  FormFieldActionButton,
  FormFieldCtaWrapper,
  InputElWrapper,
  LabelText,
  Required,
  sharedInput,
  sharedUnits,
  StyledInput,
} from './form-styled';
import { isUndefined } from '@/utils/generic';

type Props = {
  children?: ReactElement;
  name: string;
  type?: string;
  label?: string | ReactNode;
  placeholder?: string;
  className?: string;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown) => boolean | string;
  };
  showError?: boolean;
  // showPlaceholder?: boolean;
  showRequired?: boolean;
  extraElement?: ReactElement;
  showClearButton?: boolean;
  units?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type StyledProps = {
  margin?: string;
  padding?: string;
  size?: StyledInput['$inputSize'];
};

// TODO: check if it's worth using memo
// https://react-hook-form.com/advanced-usage#FormProviderPerformance

export const FormInput: FC<Props & StyledProps> = ({
  className,
  children,
  name,
  type = 'text',
  size = 'md',
  label = '',
  placeholder,
  options = {},
  margin,
  showError = true,
  showRequired = true,
  // showPlaceholder,
  extraElement,
  showClearButton = true,
  units,
  ...rest
}) => {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (typeof options.validateWithValues === 'function') {
    options.validate = (value: string) => {
      return options.validateWithValues(value, getValues());
    };
  }

  const hasError = errors[name];
  const isTextField = ['text', 'email', 'password', 'number', 'tel'].includes(type);
  const labelString = typeof label === 'string' ? (label as string) : '';
  const placeholderValue = !isTextField ? undefined : isUndefined(placeholder) ? labelString : placeholder;

  // TODO: watch makes whole form rerender, find a way to avoid it
  const value = type === 'radio' ? watch(name) === rest.value : watch(name);

  const clearButton =
    showClearButton && isTextField && !rest.readOnly && value ? (
      <FormFieldActionButton onClick={() => setValue(name, '')}>
        <CloseIcon />
      </FormFieldActionButton>
    ) : null;

  const passwordRevealButton = type === 'password' && (
    <FormFieldActionButton onClick={() => setIsPasswordVisible(state => !state)}>
      <VisibilityIcon on={!isPasswordVisible} />
    </FormFieldActionButton>
  );

  const ctaCount = [!!clearButton, !!passwordRevealButton].filter(Boolean).length;

  const inputElement = children || (
    <Input
      type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
      $inputSize={size}
      placeholder={placeholderValue}
      $hasError={hasError}
      $ctaCount={ctaCount}
      {...register(name, options)}
      {...rest}
    />
  );

  return (
    <FormFieldWrapper className={className} data-test-id={`form-input-${name}`} margin={margin}>
      <FormInputLabel>
        {label && (
          <LabelText>
            {label}
            {showRequired && options?.required && <Required> *</Required>}
          </LabelText>
        )}

        <InputElWrapper>
          {inputElement}
          {units && value && (
            <Units>
              <ValueBeforeUnits>{value}</ValueBeforeUnits> {units}
            </Units>
          )}

          <FormFieldCtaWrapper>
            {passwordRevealButton}
            {clearButton}
            {extraElement}
          </FormFieldCtaWrapper>
        </InputElWrapper>
      </FormInputLabel>

      {showError && <FormInputError name={name} errors={errors} />}
    </FormFieldWrapper>
  );
};

const Input = styled.input<StyledInput & { $ctaCount?: number }>`
  ${sharedInput}
`;

const Units = styled.span`
  ${sharedUnits}
`;

const ValueBeforeUnits = styled.span`
  opacity: 0;
  margin-right: 5px;
`;
