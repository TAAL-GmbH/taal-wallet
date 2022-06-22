import {
  cloneElement,
  FC,
  InputHTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { FormInputError } from './formInputError';
import { FormInputLabel } from './formInputLabel';
import { Checkbox } from '@/components/generic/form/checkbox';
import { Radio } from './radio';
import { FormFieldWrapper } from './formFieldWrapper';
import {
  InputElWrapper,
  LabelText,
  Required,
  sharedInput,
  StyledInput,
} from './formStyled';
import { IconButton } from '../icon-button';
import { CloseIcon } from '@/components/svg/close-icon';

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

  if (typeof options.validateWithValues === 'function') {
    options.validate = (value: string) => {
      return options.validateWithValues(value, getValues());
    };
  }

  const hasError = errors[name];
  const isCustomEl = ['checkbox', 'radio'].includes(type);
  const isTextField = ['text', 'email', 'password', 'number', 'tel'].includes(
    type
  );
  const labelString = typeof label === 'string' ? (label as string) : '';
  const placeholderValue = isTextField ? placeholder || labelString : undefined;

  const CustomEl =
    {
      checkbox: Checkbox,
      radio: Radio,
    }?.[type] || null;

  // TODO: watch makes whole form rerender, find a way to avoid it
  const value = type === 'radio' ? watch(name) === rest.value : watch(name);

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
        type={type}
        inputSize={size}
        placeholder={placeholderValue}
        hasError={hasError}
        labelOnLeft={isCustomEl}
        isCustomEl={isCustomEl}
        {...register(name, options)}
        {...rest}
      />
    );
  }

  const clearButton =
    showClearButton && isTextField && !rest.readOnly && value ? (
      <ClearButton onClick={() => setValue(name, '')}>
        <CloseIcon />
      </ClearButton>
    ) : null;

  return (
    <FormFieldWrapper
      className={className}
      data-test-id={`form-input-${name}`}
      margin={margin}
    >
      <FormInputLabel
        data-test-id={`form-label-${name}`}
        labelOnLeft={isCustomEl}
      >
        {label && (
          <LabelText data-test-id={`form-label-text-${name}`}>
            {label}
            {showRequired && options?.required && <Required> *</Required>}
          </LabelText>
        )}

        <InputElWrapper isCustomEl={isCustomEl}>
          {inputElement}
          {clearButton}
          {isCustomEl && <CustomEl isChecked={value} tabIndex={-1} />}
          {extraElement}
        </InputElWrapper>
      </FormInputLabel>

      {showError && <FormInputError name={name} errors={errors} />}
    </FormFieldWrapper>
  );
};

const Input = styled.input<StyledInput & { inputSize: StyledProps['size'] }>`
  ${sharedInput}
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: 0.6rem;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;

  svg {
    opacity: 0.5;
  }
`;
