import { FC } from 'react';

type Props = {
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
};

export const Chevron: FC<Props> = ({
  className,
  direction = 'down',
  ...rest
}) => {
  const degrees =
    {
      up: 180,
      right: 270,
      left: 90,
    }?.[direction] || 0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 30 30"
      transform={`rotate(${degrees})`}
      className={className}
      {...rest}
    >
      <path
        d="M15,22.5c-0.1,0-0.3,0-0.4-0.1l-14-14c-0.2-0.2-0.2-0.5,0-0.7s0.5-0.2,0.7,0L15,21.3L28.6,7.6c0.2-0.2,0.5-0.2,0.7,0
  s0.2,0.5,0,0.7l-14,14C15.3,22.5,15.1,22.5,15,22.5z"
      ></path>
    </svg>
  );
};
