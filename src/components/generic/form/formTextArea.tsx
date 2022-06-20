import { ComponentProps, FC } from 'react';
import styled from 'styled-components';
import { FormInput } from './formInput';
import { sharedInput } from './formStyled';

type Props = {
  rows?: number;
} & ComponentProps<typeof FormInput>;

export const FormTextArea: FC<Props> = ({ rows = 5, ...rest }) => {
  return (
    <FormInput showPlaceholder {...rest}>
      <TextArea rows={rows} />
    </FormInput>
  );
};

const TextArea = styled.textarea`
  ${sharedInput}
`;
