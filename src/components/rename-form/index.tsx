import { FC } from 'react';

import { FormInput } from '@/generic/form/form-input';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { Button } from '@/generic/button';
import { useForm } from '@/generic/form/use-form';

type Props = {
  label?: string;
  currentValue: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isUniqueFn: (name: string) => true | string;
};

export const RenameForm: FC<Props> = ({ label, currentValue, onSubmit, onClose, isUniqueFn }) => {
  const { Form } = useForm({
    defaultValues: {
      text: currentValue,
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
          validate: valueRaw => {
            const value = valueRaw.trim();

            if (value === currentValue) {
              return true;
            }

            if (value === '') {
              return 'Please enter a name';
            }
            if (value.length < 2 || value.length > 20) {
              return 'Name must be between 2 and 20 characters';
            }
            return isUniqueFn(value);
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
