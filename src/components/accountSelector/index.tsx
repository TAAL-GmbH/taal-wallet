import { db } from '@/src/db';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

type AccountType = {
  dbName: string;
  accountName: string;
  version: number;
};

export const AccountSelector: FC = () => {
  const [accountList, setAccountList] = useState<AccountType[]>(null);

  useEffect(() => {
    (async () => {
      const activeAccountId =
        (await db.getSharedKeyVal('activeAccountIndex')) || 0;
      setAccountList(await db.getAccountList());
      console.log({ activeAccountId });
    })();
  }, []);

  return (
    <Wrapper>
      <pre>{JSON.stringify(accountList)}</pre>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;
