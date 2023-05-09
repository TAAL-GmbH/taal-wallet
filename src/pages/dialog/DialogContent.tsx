import { FC } from 'react';
import styled from 'styled-components';

import { DialogData, SignPreimageData, SignTxData } from '@/src/types';
import { Tabs } from '@/src/components/tabs';
import { RawDataPreview } from './dataPreview/RawDataPreview';
import { PreimageMediaParser } from './dataPreview/PreimageMediaParser';
import { ConfirmOrigin } from './ConfirmOrigin';
import { HtmlContent } from './HtmlContent';
import { Heading } from '@/src/components/generic/heading';
import { parseRecipientListFromTx, parseScript, parseStasTx, parseTokenTx } from '@/src/utils/blockchain';
import { RecipientList } from './dataPreview/RecipientList';
import { TokenDetails } from './dataPreview/TokenDetails';
import { FromToAddress } from './FromToAddress';

type Props = {
  title: DialogData['title'];
  dialogType: DialogData['dialogType'];
  data: DialogData['data'] | undefined;
};

export const DialogContent: FC<Props> = ({ title, dialogType, data }) => {
  const tabId = parseInt(new URLSearchParams(location.search).get('tab')) || 0;
  const tabsData: Parameters<typeof Tabs>[0]['items'] = [];

  let recipientList: ReturnType<typeof parseRecipientListFromTx>;

  const onTabChange = (tabIndex: number) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', tabIndex.toString());
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
  };

  if (dialogType === 'confirm:origin') {
    return <ConfirmOrigin data={data as { origin: string }} />;
  }

  if (dialogType === 'html' && 'body' in data) {
    const body = data.body;
    return <HtmlContent body={body as string} />;
  }

  if (dialogType) {
    switch (dialogType) {
      case 'sign:transaction': {
        try {
          const txData = data as { txData: string; network: string };
          const tokenDetails = parseTokenTx(txData.txData);

          tabsData.push({
            title: 'Details',
            content: <TokenDetails data={tokenDetails} />,
          });
        } catch (e) {
          console.info('error parsing token tx!', e);
        }
        break;
      }

      case 'sign:preimage': {
        const txData = data as { preimageData: SignPreimageData; network: string };
        let symbol: string;

        try {
          const tokenDetails = parseScript(txData.preimageData.script);
          symbol = tokenDetails.symbol;

          tabsData.push({
            title: 'Details',
            content: <TokenDetails data={tokenDetails} />,
          });
        } catch (e) {
          console.info('error parsing token tx!', e);
        }

        try {
          const { isFungible } = parseStasTx(txData.preimageData.tx, txData.network);
          if (!isFungible) {
            tabsData.push({
              title: 'Media',
              content: <PreimageMediaParser data={txData} />,
            });
          }
        } catch (e) {
          console.info('error parsing stas tx!', e);
        }

        try {
          recipientList = parseRecipientListFromTx(txData.preimageData.tx, txData.network);
          if (recipientList.length) {
            tabsData.push({
              title: 'Recipients',
              content: <RecipientList recipientList={recipientList} symbol={symbol} />,
            });
          }
        } catch (e) {
          console.info('error parsing recipient list', e);
        }

        break;
      }
    }

    if (['sign:transaction', 'sign:preimage', 'sign:message'].includes(dialogType)) {
      tabsData.push({
        title: 'Raw',
        content: <RawDataPreview data={data as object} />,
      });
    }
  }

  return (
    <>
      {title && <HeadingStyled>{title}</HeadingStyled>}
      {recipientList?.length > 0 && <FromToAddress recipientList={recipientList} margin="lg 0" />}
      <div>
        {tabsData.length > 0 && (
          <Tabs items={tabsData} activeIndex={tabId} onChange={onTabChange} padding="md 0" />
        )}
      </div>
    </>
  );
};

const HeadingStyled = styled(Heading)`
  h1 {
    ${({ theme }) => theme.typography.heading3};
    font-weight: 400;
  }
`;
