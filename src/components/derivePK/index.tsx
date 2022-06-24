import { FC } from 'react';
import styled from 'styled-components';
import { Button } from '../button';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { Row } from '../generic/row';
import { useAppSelector } from '@/src/hooks';
import { createToast } from '@/src/utils/toast';
import { db } from '@/src/db';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { derivePk, restorePK } from '@/src/utils/blockchain';
import { store } from '@/src/store';
import { appendPK, setActivePk } from '@/src/features/pkSlice';

type Props = {
  className?: string;
};

export const DerivePk: FC<Props> = ({ className }) => {
  const { rootPk } = useAppSelector(state => state.pk);

  const onSubmit = async data => {
    const toast = createToast('Creating a new Wallet...');
    if (!rootPk) {
      toast.error('Please select a root PK');
      return;
    }

    try {
      const rootKey = restorePK(rootPk.privateKeyHash);
      const derivationPathLastIndex = (await db.getKeyVal('derivationPath.lastIndex')) as number;
      const path = `0/0/${derivationPathLastIndex + 1}`;

      const {
        address,
        name,
        path: fullPath,
      } = derivePk({
        rootKey,
        name: data.name,
        path,
      });

      store.dispatch(
        appendPK({
          address,
          name,
          path: fullPath,
          balance: {
            amount: null,
            updatedAt: null,
          },
        })
      );
      store.dispatch(setActivePk(address));

      navigateTo(routes.HOME);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Wrapper className={className}>
      <h1>Create a New Wallet</h1>
      <Form onSubmit={onSubmit} options={{ defaultValues: { name: '' } }} data-test-id="">
        <Row>
          <FormInput name="name" label="Name" />
        </Row>
        <Button type="submit" variant="primary">
          Next
        </Button>
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
