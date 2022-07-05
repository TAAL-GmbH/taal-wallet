import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '@/src/db';
import { sharedDb } from '@/src/db/shared';
import { AccountType } from '@/src/types';
import { isNull } from '@/src/utils/generic';
import { FormSelect } from '../generic/form/formSelect';
import { useForm } from '../generic/form/useForm';

export const AccountSelector: FC = () => {
  const [accountList, setAccountList] = useState<AccountType[]>(null);
  const [activeAccountId, setActiveAccountId] = useState<string>(null);
  const {
    Form,
    methods: { setValue },
  } = useForm({ defaultValues: { activeAccountId } });

  useEffect(() => {
    (async () => {
      const accounts = await sharedDb.getAccountList();
      setAccountList(accounts);
      const activeAccountId = (await sharedDb.getKeyVal('activeAccountId')) || accounts[0].id;
      setActiveAccountId(activeAccountId as string);
      setValue('activeAccountId', activeAccountId);
    })();
  }, []);

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
        <FormSelect
          name="activeAccountId"
          items={accountList.map(({ id: value, name: label }) => ({ label, value }))}
        />
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
