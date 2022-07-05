import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '@/src/db';
import { sharedDb } from '@/src/db/shared';
import { AccountType } from '@/src/types';
import { isNull } from '@/src/utils/generic';
import { FormSelect } from '../generic/form/formSelect';
import { useForm } from '../generic/form/useForm';
import { useAppSelector } from '@/src/hooks';
import { networkMap } from '@/src/constants/networkList';

type AccountSelectOption = {
  label: string;
  value: string;
};

export const AccountSelector: FC = () => {
  const { rootPk } = useAppSelector(state => state.pk);
  const [accountList, setAccountList] = useState<AccountType[]>(null);
  const [accountSelectOptions, setAccountSelectOptions] = useState<AccountSelectOption[]>(null);
  const [activeAccountId, setActiveAccountId] = useState<string>(null);
  const {
    Form,
    methods: { setValue },
  } = useForm({ defaultValues: { activeAccountId } });

  useEffect(() => {
    (async () => {
      const accounts = await sharedDb.getAccountList();
      setAccountList(accounts);
      setAccountSelectOptions(
        accounts.map(account => ({
          label: `${account.name} (${networkMap[account.networkId].label})`,
          value: account.id,
        }))
      );

      const activeAccountIdFromDb = (await sharedDb.getKeyVal('activeAccountId')) || accounts[0].id;

      if (activeAccountId !== activeAccountIdFromDb) {
        setActiveAccountId(activeAccountIdFromDb as string);
        setValue('activeAccountId', activeAccountIdFromDb);
      }
    })();
  }, [rootPk?.privateKeyEncrypted]);

  const switchAccount = async (accountId: AccountType['id']) => {
    await db.useAccount(accountId);
    setActiveAccountId(accountId);
    await chrome.runtime.sendMessage({ action: 'bg:reloadFromDb' });
  };

  const onChange = async ({ activeAccountId }: { activeAccountId: string }) => {
    const currentAccountId = await sharedDb.getKeyVal('activeAccountId');
    if (currentAccountId !== activeAccountId) {
      await switchAccount(activeAccountId);
    }
  };

  if (isNull(accountList)) {
    return <div>Loading account list...</div>;
  }

  return (
    <Wrapper>
      <Form onSubmit={() => {}} data-test-id="" onChange={onChange}>
        <FormSelect name="activeAccountId" items={accountSelectOptions} />
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
