import { FC } from 'react';

import { Button } from '@/generic/button';
import { Form } from '@/generic/form/form';
import { FormInput } from '@/generic/form/form-input';
import { Row } from '@/generic/row';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { createToast } from '@/utils/toast';
import { db } from '@/db';
import { derivePk, restorePK } from '@/utils/blockchain';
import { appendPK, setActivePk } from '@/features/pk-slice';
import { ButtonWrapper } from '@/generic/button-wrapper';

type Props = {
  className?: string;
  onClose: () => void;
};

export const DerivePk: FC<Props> = ({ onClose }) => {
  const { rootPk, map: walletList } = useAppSelector(state => state.pk);
  const dispatch = useAppDispatch();

  const onSubmit = async data => {
    const toast = createToast('Creating a new wallet...');
    if (!rootPk) {
      toast.error('Please select a root PK');
      return;
    }

    try {
      const rootKey = restorePK(rootPk.privateKeyHash);
      const derivationPathLastIndex = (await db.getKeyVal('derivationPath.lastIndex')) || 0;
      const path = `0'/0/${derivationPathLastIndex + 1}`;

      const {
        address,
        name,
        path: fullPath,
      } = derivePk({
        rootKey,
        name: data.name.trim(),
        path,
      });

      dispatch(
        appendPK({
          address,
          name,
          path: fullPath,
          balance: {
            satoshis: null,
            updatedAt: null,
          },
        })
      );
      dispatch(setActivePk(address));

      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Form onSubmit={onSubmit} options={{ defaultValues: { name: '' } }} data-test-id="">
      <Row>
        <FormInput
          name="name"
          label="Name"
          maxLength={40}
          options={{
            required: 'Wallet name is required',
            validate: value => {
              const existingWallet = Object.values(walletList).find(
                item => item.name.toLowerCase() === value.trim().toLowerCase()
              );
              if (existingWallet) {
                return 'Wallet with this name already exists';
              }
            },
          }}
        />
      </Row>

      <ButtonWrapper>
        <Button type="submit" variant="transparent" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Proceed
        </Button>
      </ButtonWrapper>
    </Form>
  );
};
