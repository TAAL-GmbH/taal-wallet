import {
  cloneElement,
  FC,
  InputHTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { FormInputError } from './formInputError';
import { FormInputLabel } from './formInputLabel';
import { Checkbox } from '@/components/generic/form/checkbox';
import { Radio } from './radio';
import { FormFieldWrapper } from './formFieldWrapper';
import {
  FormFieldActionButton,
  FormFieldCtaWrapper,
  InputElWrapper,
  LabelText,
  Required,
  sharedInput,
  StyledInput,
} from './formStyled';
import { IconButton } from '../icon-button';
import { CloseIcon } from '@/src/components/svg/closeIcon';
import { VisibilityIcon } from '../../svg/visibilityIcon';

type Props = {
  name: string;
  type?: string;
  label?: string | ReactNode;
  placeholder?: string;
  className?: string;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown) => boolean | string;
  };
  showError?: boolean;
  showPlaceholder?: boolean;
  showRequired?: boolean;
  children?: ReactElement;
  extraElement?: ReactElement;
  showClearButton?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type StyledProps = {
  margin?: string | boolean;
  padding?: string | boolean;
  size?: StyledInput['inputSize'];
};

// TODO: check if it's worth using memo
// https://react-hook-form.com/advanced-usage#FormProviderPerformance

export const FormInput: FC<Props & StyledProps> = ({
  className,
  name,
  type = 'text',
  size = 'md',
  label = '',
  placeholder,
  options = {},
  margin,
  showError = true,
  showRequired = true,
  showPlaceholder,
  children,
  extraElement,
  showClearButton = true,
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
  const isCustomEl = ['checkbox', 'radio'].includes(type);
  const isTextField = ['text', 'email', 'password', 'number', 'tel'].includes(type);
  const labelString = typeof label === 'string' ? (label as string) : '';
  const placeholderValue = isTextField ? placeholder || labelString : undefined;

  const CustomEl =
    {
      checkbox: Checkbox,
      radio: Radio,
    }?.[type] || null;

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

  let inputElement = null;

  if (isValidElement(children)) {
    inputElement = cloneElement(children, {
      ...(showPlaceholder ? { placeholder: placeholderValue } : {}),
      hasError,
      ...register(name, options),
      ...rest,
    });
  } else {
    inputElement = (
      <Input
        type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
        inputSize={size}
        placeholder={placeholderValue}
        hasError={hasError}
        labelOnLeft={isCustomEl}
        isCustomEl={isCustomEl}
        ctaCount={ctaCount}
        {...register(name, options)}
        {...rest}
      />
    );
  }

  return (
    <FormFieldWrapper className={className} data-test-id={`form-input-${name}`} margin={margin}>
      <FormInputLabel data-test-id={`form-label-${name}`} labelOnLeft={isCustomEl}>
        {label && (
          <LabelText data-test-id={`form-label-text-${name}`}>
            {label}
            {showRequired && options?.required && <Required> *</Required>}
          </LabelText>
        )}

        <InputElWrapper isCustomEl={isCustomEl}>
          {inputElement}
          {isCustomEl && <CustomEl isChecked={value} tabIndex={-1} />}

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

const Input = styled.input<StyledInput & { inputSize: StyledProps['size']; ctaCount?: number }>`
  ${sharedInput}
`;
