import { useEffect, useState } from 'react';
import bsv from 'bsv';

import { useGetRawTransactionDataQuery } from '../features/wocApiSlice';
import { stasScriptRegex } from '../constants';

type Props = {
  issueTxId?: string;
};

type MediaItem = {
  content?: string;
  properties: {
    mimeType: string;
  };
  attributes?: Record<string, string>;
};

type DataType = {
  version: string;
  mediaList: MediaItem[];
  enabled: boolean;
};

type Result = {
  data: DataType | null;
  symbol: string | null;
  isFungible: boolean | null;
  isLoading: boolean;
  error: string | null;
};

export const useTransactionData = ({ issueTxId }: Props) => {
  const [result, setResult] = useState<Result>({
    data: null,
    symbol: null,
    isFungible: null,
    isLoading: true,
    error: null,
  });

  const { data: respBody, isLoading } = useGetRawTransactionDataQuery(issueTxId, { skip: !issueTxId });

  useEffect(() => {
    if (respBody?.length) {
      let json: DataType = null;

      try {
        const { groups } = respBody.match(stasScriptRegex);

        // console.log('groups: ', groups);

        const s = bsv.Script.fromHex(groups.data);
        const symbol = s.chunks[0].buf?.toString('utf8');
        const data = s.chunks[1].buf?.toString('utf8');
        const isFungible = groups.flags === '0100';

        // console.log({
        //   symbol,
        //   data,
        //   isFungible,
        // });

        try {
          json = JSON.parse(data);
        } catch {
          console.log('failed to parse JSON');
        }

        setResult({
          data: json,
          symbol,
          isFungible,
          isLoading,
          error: null,
        });
      } catch (e) {
        console.error('Error parsing data: ', e);
        setResult({
          data: null,
          symbol: null,
          isFungible: null,
          isLoading,
          error: 'Error parsing data',
        });
      }
    }
  }, [respBody, isLoading]);

  return result;
};
