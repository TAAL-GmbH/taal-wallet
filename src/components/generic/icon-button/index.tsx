import { FC, ReactNode } from 'react';
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
} & ButtonType;

export const IconButton: FC<Props> = ({
  onClick,
  width = '2rem',
  height,
  className,
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <Button onClick={onClick} {...{ className, width, height, type }} {...rest}>
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
