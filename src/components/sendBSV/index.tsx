import { FC } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { Button } from '@/src/components/button';
import { createToast } from '@/src/utils/toast';
import { derivePk, isValidAddress, restorePK, sendBSV } from '@/src/utils/blockchain';
import { Form } from '../generic/form/form';
import { FormInput } from '../generic/form/formInput';
import { Row } from '../generic/row';
import { Arrow } from '../svg/arrow';
import { Heading } from '../generic/heading';
import { navigateTo } from '@/src/utils/navigation';
import { routes } from '@/src/constants/routes';
import { useBlockchain } from '@/src/hooks/useBlockchain';
import { BackButton } from '../backButton';
import { CurrentAccount } from '../currentAccount';
import { Note } from '../generic/note';
import { InfoIcon } from '../svg/infoIcon';

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
  const { getBalance } = useBlockchain();

  const onSubmit = async (values: typeof defaultValues) => {
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

        setTimeout(() => getBalance(), 5000);

        navigateTo(routes.HOME);
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
      <CurrentAccount />
      <BackButton />

      <Heading icon={<Arrow direction="upright" />}>Send BSV</Heading>

      {!activePk?.balance.amount && <Note variant="accent">You don't have any funds to send.</Note>}

      <Form
        options={{ defaultValues }}
        onSubmit={onSubmit}
        data-test-id="send-bsv-form"
        isDisabled={!activePk?.balance.amount}
      >
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
            label={`Amount in satoshis (max ${activePk?.balance.amount}-fees)`}
            type="tel"
            size="sm"
            options={{
              validate: amountStr => {
                const amount = parseInt(amountStr, 10);
                if (amount <= 0 || /^\d+$/.test(amountStr) === false) {
                  return 'Amount must be a positive integer';
                } else if (amount >= activePk?.balance.amount - 500) {
                  return 'Not enough funds';
                }
              },
              required: true,
            }}
            max={activePk?.balance.amount}
            placeholder="Amount in satoshis"
          />
        </Row>
        <ButtonRow>
          <ButtonStyled onClick={() => history.back()}>Cancel</ButtonStyled>
          <ButtonStyled variant="primary" type="submit" isDisabled={!activePk?.balance.amount}>
            Send
          </ButtonStyled>
        </ButtonRow>
      </Form>

      <Note variant="grey" icon={<InfoIcon />} padding="sm md">
        The actual available amount will differ due to the network fees.
      </Note>
      <Note variant="warning" icon={<InfoIcon />} padding="sm md">
        It works only with BSV. If you send to any other crypto wallet and/or another network, it will result
        in the loss of funds.
      </Note>
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
