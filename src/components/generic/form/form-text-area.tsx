import { ComponentProps, FC } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { FormInput } from './form-input';
import { StyledInput, sharedInput } from './form-styled';

type Props = {
  inputSize?: 'sm' | 'md' | 'lg' | undefined;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown) => boolean | string;
  };
  rows?: number;
} & ComponentProps<typeof FormInput>;

export const FormTextArea: FC<Props> = ({ name, options = {}, rows = 3, ...rest }) => {
  const { register } = useFormContext();
  return (
    <FormInput name={name} {...rest}>
      <TextArea
        rows={rows}
        placeholder={rest.placeholder}
        $inputSize={rest.size}
        {...register(name, options)}
      />
    </FormInput>
  );
};

const TextArea = styled.textarea<StyledInput>`
  ${sharedInput}
  height: unset;
`;
