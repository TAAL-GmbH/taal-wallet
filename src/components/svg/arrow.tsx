import { FC } from 'react';

type Props = {
  className?: string;
  direction?: 'up' | 'upright' | 'right' | 'downright' | 'down' | 'downleft' | 'left' | 'upleft';
};

export const Arrow: FC<Props> = ({ className, direction = 'right', ...rest }) => {
  const degrees =
    {
      up: -90,
      upright: -45,
      right: 0,
      downright: 45,
      down: 90,
      downleft: 135,
      left: 180,
      upleft: 225,
    }?.[direction] || 0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 24 24"
      transform={`rotate(${degrees})`}
      className={className}
      {...rest}
    >
      <path d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"></path>
    </svg>
  );
};
