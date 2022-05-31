import { FC } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

const sizes = {
  sm: 20,
  md: 30,
  lg: 40,
};

export const Spinner: FC<Props> = ({
  className,
  size = 'lg',
  color = '#fff',
}) => {
  return (
    <Wrapper className={className} size={size} color={color}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </Wrapper>
  );
};

const Wrapper = styled.div<Props>`
  ${({ size: sizeEnum = 'lg', color }) => {
    const size = sizes[sizeEnum];
    const borderSize = size / 10;

    return css`
      display: inline-block;
      position: relative;
      width: ${size}px;
      height: ${size}px;

      & > div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: ${size * 0.8}px;
        height: ${size * 0.8}px;
        margin: ${borderSize}px;
        border: ${borderSize}px solid ${color};
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: ${color} transparent transparent transparent;
      }
      & div:nth-child(1) {
        animation-delay: -0.45s;
      }
      & div:nth-child(2) {
        animation-delay: -0.3s;
      }
      & div:nth-child(3) {
        animation-delay: -0.15s;
      }
      @keyframes lds-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `;
  }};
`;
