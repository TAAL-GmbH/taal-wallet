import { FC, ImgHTMLAttributes, useEffect, useState } from 'react';
import styled from 'styled-components';

const noImageUrl = '/no-image.png';
const loadingUrl = '/spinner-1s-58px.gif';

type Props = {
  src: string | null;
  fallbackSrc?: string;
  alt?: string;
} & ImgHTMLAttributes<HTMLImageElement>;

export const ImageWithFallback: FC<Props> = ({ src, fallbackSrc = noImageUrl, alt, ...rest }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(!src ? noImageUrl : null);
  const [isImgLoading, setIsImgLoading] = useState(!!src);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsImgLoading(false);
    };
    img.onerror = () => {
      setImgSrc(fallbackSrc);
      setIsImgLoading(false);
    };
  }, [src, fallbackSrc, setImgSrc, setIsImgLoading]);

  return <Img src={isImgLoading ? loadingUrl : imgSrc} alt={alt} {...rest} />;
};

const Img = styled.img`
  &[src='${noImageUrl}'] {
    object-fit: scale-down;
    border: none;
    border-radius: 0;
  }
`;
