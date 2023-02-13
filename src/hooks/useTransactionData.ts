import { useEffect, useState } from 'react';
import bsv from 'bsv';

import { useGetRawTransactionDataQuery } from '../features/wocApiSlice';

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

      const stasScriptRegex = new RegExp(
        '76a914(?<addr>[a-f0-9]{40})88ac6976aa607f5f7f7c5e7f7c5d7f7c5c7f7c5b7f7c5a7f7c597f7c587f7c577f7c567f7c557f7c547f7c537f7c527f7c517f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7c5f7f7c5e7f7c5d7f7c5c7f7c5b7f7c5a7f7c597f7c587f7c577f7c567f7c557f7c547f7c537f7c527f7c517f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e01007e818b21414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff007d976e7c5296a06394677768827601249301307c7e23022079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798027e7c7e7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e01417e21038ff83d8cf12121491609c4939dc11c4aa35503508fe432dc5a5c1905608b9218ad547f7701207f01207f7701247f517f7801007e8102fd00a063546752687f7801007e817f727e7b01177f777b557a766471567a577a786354807e7e676d68aa880067765158a569765187645294567a5379587a7e7e78637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6867567a6876aa587a7d54807e577a597a5a7a786354807e6f7e7eaa727c7e676d6e7eaa7c687b7eaa587a7d877663516752687c72879b69537a647500687c7b547f77517f7853a0916901247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f77788c6301247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f777852946301247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f77686877517f7c52797d8b9f7c53a09b91697c76638c7c587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f777c6876638c7c587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f777c6863587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f7768587f517f7801007e817602fc00a06302fd00a063546752687f7801007e81727e7b7b687f75537f7c0376a9148801147f775379645579887567726881766968789263556753687a76026c057f7701147f8263517f7c766301007e817f7c6775006877686b537992635379528763547a6b547a6b677c6b567a6b537a7c717c71716868547a587f7c81547a557964936755795187637c686b687c547f7701207f75748c7a7669765880748c7a76567a876457790376a9147e7c7e557967041976a9147c7e0288ac687e7e5579636c766976748c7a9d58807e6c0376a9147e748c7a7e6c7e7e676c766b8263828c007c80517e846864745aa0637c748c7a76697d937b7b58807e56790376a9147e748c7a7e55797e7e6868686c567a5187637500678263828c007c80517e846868647459a0637c748c7a76697d937b7b58807e55790376a9147e748c7a7e55797e7e687459a0637c748c7a76697d937b7b58807e55790376a9147e748c7a7e55797e7e68687c537a9d547963557958807e041976a91455797e0288ac7e7e68aa87726d77776a14(?<pid>[a-f0-9]{40})(?<flags>0100|0101)(?<data>[a-f0-9]*)+$'
      );

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
