import { Token } from '@/src/features/wocApiSlice';
import { preloadImage } from '@/src/utils/preloadImage';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dl, Li } from '../generic/styled';

type Props = {
  token: Token;
};

export const TokenItem: FC<Props> = ({ token }) => {
  const { protocol, balance, image, redeemAddr, symbol, tokenBalance } = token;

  const [imageSrc, setImageSrc] = useState<string>(null);
  const [isInvalidImage, setIsInvalidImage] = useState<boolean>(false);

  useEffect(() => {
    if (image) {
      preloadImage(image)
        .then(() => {
          setImageSrc(image);
        })
        .catch(() => {
          setIsInvalidImage(true);
        });
    }
  }, [image]);

  return (
    <Li key={symbol}>
      {imageSrc && <Image src={imageSrc} alt={symbol} />}
      {isInvalidImage && <InvalidImage>No image</InvalidImage>}
      <Dl>
        <dt>Protocol:</dt>
        <dd>{protocol}</dd>
        <dt>Balance:</dt>
        <dd>{balance}</dd>
        <dt>Redeem Addr:</dt>
        <dd>{redeemAddr}</dd>
        <dt>Symbol:</dt>
        <dd>{symbol}</dd>
        <dt>Token Balance:</dt>
        <dd>{tokenBalance}</dd>
      </Dl>
    </Li>
  );
};

const Image = styled.img`
  max-width: 100px;
  max-height: 100px;
`;

const InvalidImage = styled.div`
  background-color: ${({ theme }) => theme.color.grey[100]};
  border: ${({ theme }) => theme.color.grey[200]} 1px solid;
  width: 100px;
  padding: 1.2rem 1rem 0.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;
