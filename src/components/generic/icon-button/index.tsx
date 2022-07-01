import { trackEvent } from '@/utils/tracking';
import { FC, ReactNode } from 'react';
import { TrackEventOptions } from 'src/types';
import styled from 'styled-components';

type ButtonType = {
  width?: string;
  height?: string;
};

type Props = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  trackEvent?: TrackEventOptions;
} & ButtonType;

export const IconButton: FC<Props> = ({
  onClick,
  width = '2rem',
  height,
  className,
  children,
  type = 'button',
  trackEvent: trackEventOptions,
  ...rest
}) => {
  const _onClick = () => {
    if (trackEventOptions) {
      trackEvent({
        category: 'button',
        action: 'click',
        ...trackEventOptions,
      });
    }
    onClick();
  };

  return (
    <Button onClick={_onClick} {...{ className, width, height, type }} {...rest}>
      {children}
    </Button>
  );
};

const Button = styled.button<ButtonType>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.1rem;
  width: ${p => p.width};
  height: ${p => p.height};

  svg {
    fill: currentColor;
    width: 100%;
    height: 100%;
  }
`;
