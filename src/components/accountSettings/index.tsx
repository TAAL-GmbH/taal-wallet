import { useAppSelector } from '@/src/hooks';
import { FC } from 'react';
import styled from 'styled-components';
import { Button } from '../button';
import { FormInput } from '../generic/form/formInput';
import { useForm } from '../generic/form/useForm';
import { Heading } from '../generic/heading';
import { Row } from '../generic/row';

type Props = {
  className?: string;
};

export const AccountSettings: FC<Props> = ({ className }) => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);

  const account = accountMap[activeAccountId];
  console.log(account);

  const { Form } = useForm({
    defaultValues: {
      accountName: 'account.name',
    },
  });

  const onSubmit = console.log;

  return (
    <Wrapper className={className}>
      <Heading>Account Settings</Heading>

      <Form onSubmit={onSubmit} data-test-id="">
        <Row>
          <FormInput
            label="Account name"
            name="accountMame"
            type="text"
            placeholder="Input your account name"
            options={{
              required: 'Account name is required',
            }}
          />
        </Row>
        <Row>
          <Button type="submit">Save</Button>
        </Row>
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
