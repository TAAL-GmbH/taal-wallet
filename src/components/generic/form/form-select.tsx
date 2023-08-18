import { ComponentProps, FC } from 'react';
import styled from 'styled-components';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import { FormInput } from './form-input';
import { StyledInput, sharedInput } from './form-styled';
import { Chevron } from '@/svg/chevron';

type Item = {
  value: string | number;
} & ({ label: string } | { name: string });

type Props = {
  items: Item[];
  inputSize?: 'sm' | 'md' | 'lg' | undefined;
  options?: RegisterOptions & {
    validateWithValues?: (arg0: unknown, arg1: unknown) => boolean | string;
  };
} & Omit<ComponentProps<typeof FormInput>, 'type'>;

export const FormSelect: FC<Props> = ({ name, items, options, ...rest }) => {
  const { register } = useFormContext();

  return (
    <FormInput name={name} {...rest} type={null} extraElement={<ChevronStyled />}>
      <Select {...register(name, options)} name={name}>
        {items.map(item => {
          const label = 'label' in item ? item.label : ('name' in item && item.name) || 'no-label';
          return <option key={label} label={label} {...item} />;
        })}
      </Select>
    </FormInput>
  );
};

const Select = styled.select<StyledInput>`
  ${sharedInput}

  cursor: pointer;
`;

const ChevronStyled = styled(Chevron)`
  position: absolute;
  right: 0px;
  top: -6px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  fill: ${({ theme }) => theme.color.grey[800]};
`;
