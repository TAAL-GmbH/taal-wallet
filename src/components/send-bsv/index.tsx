import { FC, useEffect } from 'react';
import styled from 'styled-components';
import Decimal from 'decimal.js';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { Button } from '@/components/generic/button';
import { createToast } from '@/utils/toast';
import { derivePk, isValidAddress, restorePK, sendBSV } from '@/utils/blockchain';
import { FormInput } from '@/generic/form/form-input';
import { Row } from '@/generic/row';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { Note } from '@/generic/note';
import { InfoIcon } from '@/components/svg/info-icon';
import { setIsSendBsvLocked } from '@/features/pk-slice';
import { MinimalLayout } from '@/components/layout/minimal-layout';
import { BsvIcon } from '@/components/svg/bsv-icon';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { gap, margin, padding } from '@/utils/inject-spacing';
import { useForm } from '@/generic/form/use-form';
import { Amount } from '@/components/amount';

type FormInputs = {
  dstAddress: string;
  amountInBsv: number;
};

const defaultValues: FormInputs = {
  dstAddress: '',
  amountInBsv: null,
};

export const SendBSV: FC = () => {
  const dispatch = useAppDispatch();
  const { activePk, rootPk, network, isSendBsvLocked } = useAppSelector(state => state.pk);
  const { Form, methods } = useForm({ defaultValues });

  useEffect(() => {
    // clear state just in case window was closed right after sending BSV
    if (isSendBsvLocked) {
      dispatch(setIsSendBsvLocked(false));
    }
  }, []);

  const onSubmit = async (values: typeof defaultValues) => {
    const { dstAddress, amountInBsv } = values;

    const bsvDecimal = new Decimal(amountInBsv);
    const satsDecimal = bsvDecimal.mul(1e8);
    const satoshis = satsDecimal.toDecimalPlaces(0).toNumber();

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
        satoshis: Number(satoshis),
        privateKeyHash: pk.privateKeyHash,
        network: network.envName,
      });

      if (success) {
        console.log('BSV sent successfully', data);
        toast.success('BSV sent successfully');

        setTimeout(() => navigateTo(routes.HOME), 1000);
      } else {
        toast.error(error.message);
      }
    } catch (e) {
      console.error('Error sending BSV', e);
      toast.error(e.message);
    } finally {
      dispatch(setIsSendBsvLocked(true));
      setTimeout(() => {
        dispatch(setIsSendBsvLocked(false));
      }, 5000);
    }
  };

  const assignMax = () => {
    if (!activePk?.balance.satoshis) {
      return;
    }
    methods.setValue('amountInBsv', activePk.balance.satoshis / 1e8 - 500 / 1e8);
  };

  const header = <span>Send token</span>;

  return (
    <MinimalLayout header={header}>
      <FakeLabel>Token</FakeLabel>
      <FakeDropdown>
        <BsvIcon />
        BSV
      </FakeDropdown>

      <Row margin="xs 0 md">
        Balance available: <Amount sats={activePk?.balance.satoshis} />
      </Row>

      {isSendBsvLocked && (
        <Note variant="accent" icon={<InfoIcon />} padding="sm md">
          Please wait while your previous transaction is being processed.
        </Note>
      )}

      <Form
        options={{ defaultValues }}
        onSubmit={onSubmit}
        data-test-id="send-bsv-form"
        isDisabled={!activePk?.balance.satoshis}
      >
        <Row>
          <FormInput
            name="amountInBsv"
            label={`Amount`}
            type="tel"
            options={{
              validate: amountStr => {
                const satoshis = parseFloat(amountStr) * 1e8;
                if (/^[\d.]+$/.test(amountStr) === false) {
                  return 'Amount must be a positive integer';
                } else if (satoshis < 1) {
                  return 'Amount must be at least 1 satoshi';
                } else if (satoshis > activePk?.balance.satoshis - 500) {
                  return 'Not enough funds';
                }
              },
              required: true,
            }}
            units="BSV"
            max={activePk?.balance.satoshis / 1e8}
            placeholder="Amount in BSV"
            extraElement={
              <ButtonMax type="button" onClick={assignMax}>
                MAX
              </ButtonMax>
            }
          />
        </Row>

        <Row>
          <FormInput
            name="dstAddress"
            label="Recipient address"
            placeholder="Enter address"
            required
            options={{
              validate: addr => isValidAddress(addr, network.envName),
              required: true,
            }}
          />
        </Row>

        {/* <Note variant="grey" icon={<InfoIcon />} padding="sm md">
          The actual available amount will differ due to the network fees.
        </Note>
        <Note variant="warning" icon={<InfoIcon />} padding="sm md">
          It works only with BSV. If you send to any other crypto wallet and/or another network, it will
          result in the loss of funds.
        </Note> */}

        <ButtonWrapper>
          <Button variant="transparent" onClick={() => history.back()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isDisabled={!activePk?.balance.satoshis || isSendBsvLocked}>
            Send
          </Button>
        </ButtonWrapper>
      </Form>
    </MinimalLayout>
  );
};

const FakeLabel = styled.div`
  ${({ theme }) => theme.typography.heading6};
  ${margin`xl 0 sm`};
`;

const FakeDropdown = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  border: 1px solid ${({ theme }) => theme.color.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  box-sizing: border-box;
  ${({ theme }) => theme.typography.body2};
  ${gap`sm`};
  ${padding`xs md`};

  svg {
    height: 24px;
    width: 24px;
  }
`;

const ButtonMax = styled.button`
  pointer-events: all;
  height: 24px;
  background: none;
  border: 1px solid ${({ theme }) => theme.color.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.primary[500]};
    color: #fff;
  }
`;
