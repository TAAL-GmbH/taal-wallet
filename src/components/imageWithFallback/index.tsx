import { FC, ImgHTMLAttributes, memo, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import styled from 'styled-components';

const noImageUrl = '/no-image.png';
const loadingUrl = '/spinner-1s-58px.gif';

type Props = {
  src: string | null;
  fallbackSrc?: string;
  alt?: string;
  onSuccess?: () => void;
  onError?: () => void;
} & ImgHTMLAttributes<HTMLImageElement>;

const ImageWithFallbackComponent: FC<Props> = ({
  src,
  fallbackSrc = noImageUrl,
  alt,
  onSuccess,
  onError,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(!src ? noImageUrl : null);
  const [isImgLoading, setIsImgLoading] = useState(!!src);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsImgLoading(false);
      onSuccess?.();
    };
    img.onerror = () => {
      setImgSrc(fallbackSrc);
      setIsImgLoading(false);
      onError?.();
    };
  }, [src, fallbackSrc, setImgSrc, setIsImgLoading, onError, onSuccess]);

  return <Img src={isImgLoading ? loadingUrl : imgSrc} alt={alt} {...rest} />;
};

export const ImageWithFallback: FC<Props> = memo(ImageWithFallbackComponent, isEqual);

const Img = styled.img`
  &[src='${noImageUrl}'] {
    object-fit: scale-down;
    border: none;
    border-radius: 0;
  }
`;
