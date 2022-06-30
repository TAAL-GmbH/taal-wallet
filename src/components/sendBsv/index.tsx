import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { Button } from '@/src/components/button';
import { createToast } from '@/src/utils/toast';
import { derivePk, isValidAddress, restorePK, sendBSV } from '@/src/utils/blockchain';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { Row } from '../generic/row';
import { QuickWalletSelector } from '../quickWalletSelector';
import { RoundIconWrapper } from '../generic/RoundIconWrapper';
import { Arrow } from '../svg/arrow';

type Props = {
  className?: string;
};

type FormInputs = {
  dstAddress: string;
  amount: number;
};

const defaultValues: FormInputs = {
  dstAddress: '',
  amount: null,
};

export const SendBSV: FC<Props> = ({ className }) => {
  const { activePk, rootPk, network } = useAppSelector(state => state.pk);

  // TODO: type this
  const onSubmit = async (values: any) => {
    const { dstAddress, amount } = values;

    const toast = createToast('Sending BSV...');
    if (!activePk?.address) {
      toast.error('Please select a PK');
      return;
    }

    try {
      const rootKey = restorePK(rootPk.privateKeyHash);
      const pk = derivePk({
        rootKey,
        path: activePk.path,
      });

      const { success, data, error } = await sendBSV({
        srcAddress: activePk.address,
        dstAddress,
        amount: Number(amount),
        privateKeyHash: pk.privateKeyHash,
        network: network.envName,
      });

      if (success) {
        console.log('BSV sent successfully', data);
        toast.success('BSV sent successfully');
      } else {
        toast.error(error.message);
      }
    } catch (e) {
      console.error('Error sending BSV', e);
      toast.error(e.message);
    }
  };

  return (
    <Wrapper className={className}>
      <QuickWalletSelector />
      <h1>
        <RoundIconWrapper>
          <Arrow direction="upright" />
        </RoundIconWrapper>
        Send BSV
      </h1>
      <Form options={{ defaultValues }} onSubmit={onSubmit} data-test-id="send-bsv-form">
        <Row>
          <FormInput
            name="dstAddress"
            label="Destination address"
            size="sm"
            placeholder="Destination address"
            required
            options={{
              validate: addr => isValidAddress(addr, network.envName),
              required: true,
            }}
          />
        </Row>
        <Row>
          <FormInput
            name="amount"
            label={`Amount in Satoshis (max ${activePk?.balance.amount})`}
            type="tel"
            size="sm"
            options={{
              validate: amount => amount <= activePk?.balance.amount,
              required: true,
            }}
            max={activePk?.balance.amount}
            placeholder="Amount in Satoshis"
          />
        </Row>
        <ButtonRow>
          <ButtonStyled onClick={() => history.back()}>Cancel</ButtonStyled>
          <ButtonStyled variant="primary" type="submit">
            Send
          </ButtonStyled>
        </ButtonRow>
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const ButtonRow = styled(Row)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ButtonStyled = styled(Button)`
  width: 100%;
`;
