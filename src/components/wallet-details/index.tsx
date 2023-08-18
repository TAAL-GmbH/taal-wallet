import { FC, useState } from 'react';
import dayjs from 'dayjs';
import { getBalance } from '@/features/woc-api';
import { PKType } from '@/types';
import { formatNumber, isNull } from '@/utils/generic';
import { createToast } from '@/utils/toast';
import { AnchorLink } from '@/components/anchor-link';
import { CopyToClipboard } from '@/components/generic/copy-to-clipboard';
import { Dl } from '@/generic/styled';

type Props = {
  className?: string;
  data: PKType;
};

export const WalletDetails: FC<Props> = ({ className, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { name, path, address, balance } = data || ({} as PKType);

  if (!data || !address) {
    return null;
  }

  const balanceFormated =
    typeof balance?.satoshis === 'number' ? `${formatNumber(balance?.satoshis)} satoshis` : 'unknown';

  const _getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!address) {
      toast.error('Please select an address');
      return;
    }
    const result = await getBalance([address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
    }
  };

  const extraContent = (
    <>
      <dt>Path:</dt>
      <dd>{path}</dd>
    </>
  );

  return (
    <Dl $padding="0" $margin="xs 0" className={className}>
      <dt>Name:</dt>
      <dd>{name}</dd>

      <dt>Address:</dt>
      <dd>
        <CopyToClipboard textToCopy={address}>{address}</CopyToClipboard>
      </dd>

      <dt>Balance:</dt>
      <dd>
        {balanceFormated} (
        <AnchorLink href="#" onClick={_getBalance}>
          refresh
        </AnchorLink>
        )
      </dd>
      {balance?.updatedAt && (
        <>
          <dt>Updated at:</dt>
          <dd>{dayjs(balance.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</dd>
        </>
      )}

      {isExpanded && extraContent}

      <dt>
        <AnchorLink href="#" onClick={() => setIsExpanded(s => !s)}>
          {isExpanded ? 'Show less' : 'Show more'}
        </AnchorLink>
      </dt>
    </Dl>
  );
};
