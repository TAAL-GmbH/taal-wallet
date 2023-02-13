import { FC, SyntheticEvent } from 'react';
import styled from 'styled-components';

import { decodeBase64 } from '@/src/utils/base64';
import { MediaType } from '@/src/types';
import { ImageWithFallback } from '@/components/imageWithFallback';

import { AttributesPreview } from './attributes-preview';
import { Note } from '../generic/note';

const createMediaContentInBase64 = ({ mimeType, contentBase64 }) =>
  contentBase64 ? `data:${mimeType};base64, ${contentBase64}` : null;

type Props = {
  media: MediaType;
  index: number;
  onImageLoaded?: () => void;
  onAudioVideoLoaded?: (evt: SyntheticEvent) => void;
  onError?: () => void;
  showAttributes: boolean;
};

export const MediaPreviewItem: FC<Props> = ({
  media,
  index,
  onImageLoaded = () => {},
  onAudioVideoLoaded = () => {},
  onError = () => {},
  showAttributes = true,
}) => {
  if (!media) {
    return null;
  }

  const canRenderMedia = ['image', 'video', 'audio', 'text'].includes(media?.mimeType?.split('/')[index]);

  const mediaDataContent = createMediaContentInBase64({
    mimeType: media?.mimeType,
    contentBase64: media?.contentBase64,
  });

  return (
    <>
      {media.isImage && (
        <Img src={mediaDataContent} alt="Media preview" onSuccess={onImageLoaded} onError={onError} />
      )}
      {media.isVideo && (
        <video
          key={media.fileName}
          width="100%"
          height="100%"
          controls
          onLoadedData={onAudioVideoLoaded}
          onError={onError}
        >
          <source src={mediaDataContent} type={media.mimeType} />
        </video>
      )}
      {media.isAudio && (
        <audio key={media.fileName} controls onLoadedData={onAudioVideoLoaded} onError={onError}>
          <source src={mediaDataContent} type={media.mimeType} />
        </audio>
      )}
      {media.isText && (
        <Textarea value={decodeBase64(mediaDataContent.split('base64')[1])} readOnly></Textarea>
      )}
      {media?.contentBase64 && !canRenderMedia && <Note variant="warning">File can not be rendered.</Note>}
      {media && !media.contentBase64 && <Note variant="accent">Token contains no media</Note>}

      {showAttributes && <AttributesPreview attributeList={media.attributeList} />}
    </>
  );
};

const Img = styled(ImageWithFallback)`
  max-width: 100%;
  max-height: 600px;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  padding: 10px;
`;
