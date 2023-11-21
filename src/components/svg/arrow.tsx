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
      transform={`rotate(${degrees + 180})`}
      className={className}
      {...rest}
    >
      <path d="M10.7071 4.29289C11.0976 4.68342 11.0976 5.31658 10.7071 5.70711L5.41421 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H5.41421L10.7071 18.2929C11.0976 18.6834 11.0976 19.3166 10.7071 19.7071C10.3166 20.0976 9.68342 20.0976 9.29289 19.7071L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L9.29289 4.29289C9.68342 3.90237 10.3166 3.90237 10.7071 4.29289Z" />
    </svg>
  );
};
