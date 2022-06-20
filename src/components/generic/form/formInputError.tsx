import { FC } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';

type Props = {
  name: string;
  errors: unknown;
};

export const FormInputError: FC<Props> = ({ name, errors }) => {
  return (
    <ErrorMessage
      render={({ message }) => (
        <Message data-test-id={`error-label-${name}`}>{message}</Message>
      )}
      name={name}
      errors={errors}
    />
  );
};

const Message = styled.div`
  color: var(--errorColor);
  font-size: 0.9rem;
  position: relative;
  top: -2px;
`;
