import { FC } from 'react';

import { navigateTo } from '@/utils/navigation';
import { Button } from '@/generic/button';
import { Heading } from '@/generic/heading';
import { routes } from '@/constants/routes';
import { Row } from '@/generic/row';
import { FungibleEmptyList } from '@/svg/fungible-empty-list';
import { NftEmptyList } from '@/components/svg/nft-empty-list';
import { VCenter } from '@/generic/styled';

type Props = {
  type: 'fungible' | 'nft';
};

export const NoTokens: FC<Props> = ({ type }) => {
  const heading = type === 'nft' ? 'You don’t have any NFT’s yet' : 'You don’t have any tokens yet';

  return (
    <VCenter>
      {type === 'nft' ? <NftEmptyList /> : <FungibleEmptyList />}
      <Heading level={6} center margin="md 0">
        {heading}
      </Heading>

      <Row margin="xxl 0 md">
        <Button variant="primary" onClick={() => navigateTo(routes.RECEIVE_BSV)}>
          Receive
        </Button>
      </Row>
    </VCenter>
  );
};
