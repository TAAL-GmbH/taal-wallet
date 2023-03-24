import { FC } from 'react';

import { useTransactionData } from '@/src/hooks/useTransactionData';
import { MediaType } from '@/src/types';
import { isNull } from '@/src/utils/generic';

import { MediaPreviewItem } from './media-prevew-item';

type Props = {
  issueTxId?: string;
  data?: ReturnType<typeof useTransactionData>['data'];
};

export const NftMediaPreview: FC<Props> = ({ issueTxId, data: datafromProps }) => {
  const { data: dataFromApi, error } = useTransactionData({
    issueTxId,
  });

  const data = datafromProps || dataFromApi;

  if (!data) {
    return null;
  }

  if (error || isNull(data) || !data.version || !Array.isArray(data.mediaList)) {
    return <div>Invalid data</div>;
  }

  return (
    <div>
      {data.mediaList.map((item, index) => {
        const { mimeType } = item.properties;
        const isAudio = mimeType?.startsWith('audio/');
        const isVideo = mimeType?.startsWith('video/');
        const isImage = mimeType?.startsWith('image/');
        const isText = mimeType?.startsWith('text/');

        const media: MediaType = {
          mimeType,
          isAudio,
          isVideo,
          isImage,
          isText,
          attributeList: Object.entries(item.attributes).map(([key, value]) => ({ key, value })),
          size: 0,
          fileName: null,
          contentBase64: item.content,
          isValidContent: null,
        };

        return <MediaPreviewItem key={index} media={media} index={index} showAttributes />;
      })}
    </div>
  );
};
