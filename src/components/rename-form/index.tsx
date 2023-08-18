import { FC } from 'react';

import { FormInput } from '@/generic/form/form-input';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { Button } from '@/generic/button';
import { useForm } from '@/generic/form/use-form';

type Props = {
  label?: string;
  value: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export const RenameForm: FC<Props> = ({ label, value, onSubmit, onClose }) => {
  const { Form } = useForm({
    defaultValues: {
      text: value,
    },
    mode: 'onBlur',
  });

  const _onSubmit = (formData: { text: string }) => {
    onSubmit(formData.text.trim());
  };

  return (
    <Form onSubmit={_onSubmit}>
      <FormInput
        name="text"
        label={label}
        placeholder="Enter new name"
        options={{
          required: true,
          validate: value => {
            if (value.trim() === '') {
              return 'Please enter a name';
            }
            if (value.trim().length < 2 || value.trim().length > 20) {
              return 'Name must be between 2 and 20 characters';
            }
          },
        }}
      />
      <ButtonWrapper>
        <Button type="button" onClick={onClose} variant="transparent">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </ButtonWrapper>
    </Form>
  );
};
