import { FC, useEffect, useState } from 'react';

import { useGetTokenDetailsQuery } from '@/features/woc-api-slice';
import { Note } from '@/generic/note';
import { useTransactionData } from '@/hooks/use-transaction-data';
import { MinimalLayout } from '@/components/layout/minimal-layout';
import { Spinner } from '../spinner';
import { DetailsView } from './details-view';

type Props = {
  tokenId: string;
  symbol: string;
};

export const TokenDetails: FC<Props> = ({ tokenId, symbol }) => {
  const [issueTxId, setIssueTxId] = useState<string | null>(null);
  const { data, isFetching } = useGetTokenDetailsQuery({ tokenId, symbol });
  const { isFungible } = useTransactionData({
    issueTxId,
  });

  const tokenData = data?.token;

  useEffect(() => {
    if (tokenData?.issuance_txs.length) {
      setIssueTxId(tokenData.issuance_txs[0]);
    }
  }, [tokenData?.issuance_txs]);

  let contents: JSX.Element | null = null;

  if (isFetching) {
    contents = <Spinner />;
  } else if (!tokenData) {
    contents = <Note>Token not found</Note>;
  } else {
    contents = <DetailsView tokenData={tokenData} isFungible={isFungible} issueTxId={issueTxId} />;
  }

  const header = <span>Contract details</span>;

  return <MinimalLayout header={header}>{contents}</MinimalLayout>;
};
