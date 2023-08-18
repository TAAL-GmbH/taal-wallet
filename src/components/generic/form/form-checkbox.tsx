import { FC, InputHTMLAttributes, ReactNode } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { CheckboxIcon } from '@/components/svg/checkbox-icon';

import { FormFieldWrapper } from './form-field-wrapper';
import { FormInputError } from './form-input-error';

type Props = {
  name: string;
  label?: string | ReactNode;
  className?: string;
  showError?: boolean;
  margin?: string;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown, meta: { name: string }) => boolean | string;
  };
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'>;

export const FormCheckbox: FC<Props> = ({ name, label, options, className, margin, showError = true }) => {
  const {
    register,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();

  if (typeof options?.validateWithValues === 'function') {
    options.validate = (v: string) => options.validateWithValues?.(v, getValues(), { name });
  }

  const hasError = !!errors[name];

  return (
    <FormFieldWrapper className={className} margin={margin}>
      <Label $hasError={hasError}>
        <CheckboxIconStyled isChecked={watch(name)} />
        <input type="checkbox" {...register(name, options)} />
        <Content>{label}</Content>
      </Label>
      {showError && <FormInputError name={name} errors={errors} />}
    </FormFieldWrapper>
  );
};

const Label = styled.label<{ $hasError: boolean }>`
  display: grid;
  grid-template-columns: 1.6rem auto;
  gap: 0.4rem;
  flex: 1 0 auto;
  align-items: center;

  ${({ $hasError }) =>
    $hasError &&
    css`
      margin-bottom: 0.4rem;
    `}

  input[type='checkbox'] {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
    outline: 0;
    -webkit-appearance: none;
  }
`;

const CheckboxIconStyled = styled(CheckboxIcon)<{ isChecked: boolean }>`
  width: 1.4rem;
  height: 1.4rem;
`;

const Content = styled.span`
  font-size: 0.9rem;
`;
