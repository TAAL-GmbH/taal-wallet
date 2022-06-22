import { Chevron } from '@/components/svg/chevron';
import { ComponentProps, FC } from 'react';
import styled from 'styled-components';
import { FormInput } from './formInput';
import { sharedInput } from './formStyled';

type Item = {
  value: string | number;
} & ({ label: string } | { name: string });

type Props = {
  items: Item[];
} & ComponentProps<typeof FormInput>;

export const FormSelect: FC<Props> = ({ items, ...rest }) => {
  return (
    <FormInput
      showClearButton={false}
      extraElement={<ChevronStyled />}
      {...rest}
    >
      <Select>
        {items.map(item => {
          const label =
            'label' in item ? item.label : 'name' in item && item.name;
          return <option key={label} label={label} {...item} />;
        })}
      </Select>
    </FormInput>
  );
};

const Select = styled.select`
  ${sharedInput}

  cursor: pointer;
`;

const ChevronStyled = styled(Chevron)`
  position: absolute;
  right: 14px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  fill: ${({ theme }) => theme.color.grey[500]};
`;
