import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { Button } from '../button';
import { Mnemonic } from 'bsv';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { FormWrapper } from '../generic/form/formStyled';
import { Row } from '../generic/row';
import { useAppSelector } from '@/src/hooks';
import { createToast } from '@/src/utils/toast';
import { db } from '@/src/db';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';

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
      const masterKey = pk.restorePK(rootPk.privateKeyHash);
      const derivationPathLastIndex = (await db.getKeyVal(
        'derivationPath.lastIndex'
      )) as number;
      const path = `0/0/${derivationPathLastIndex + 1}`;
      console.log({ masterKey, data, derivationPathLastIndex });

      pk.derive({
        masterKey,
        name: data.name,
        path,
        network: masterKey.network.name,
      });
      db.setKeyVal('derivationPath.lastIndex', derivationPathLastIndex + 1);
      navigateTo(routes.HOME);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Wrapper className={className}>
      <h1>Create a New Wallet</h1>
      <Form
        onSubmit={onSubmit}
        options={{ defaultValues: { name: '' } }}
        data-test-id=""
      >
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
