import { FC } from 'react';
import styled from 'styled-components';

import { Box } from '@/src/components/generic/box';
import { NftMediaPreview } from '@/src/components/nft-media-preview';
import { parseStasTx } from '@/src/utils/blockchain';
import { SignPreimageData } from '@/src/types';
import { Note } from '@/src/components/generic/note';

type Props = {
  data: {
    preimageData: SignPreimageData;
    network: string;
  };
};

export const PreimageMediaParser: FC<Props> = ({ data: { preimageData, network } }) => {
  try {
    const parsedStasTx = parseStasTx(preimageData.tx, network);

    return (
      <BoxStyled>
        <NftMediaPreview data={parsedStasTx.data} />
      </BoxStyled>
    );
  } catch (e) {
    console.log('error parsing stas tx', e);
    return <Note variant="error">Error parsing token media</Note>;
  }
};

const BoxStyled = styled(Box)`
  pre {
    overflow: auto;
  }
`;
