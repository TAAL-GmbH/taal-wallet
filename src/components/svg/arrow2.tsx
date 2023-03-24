import { FC } from 'react';

type Props = {
  className?: string;
  direction?: 'up' | 'upright' | 'right' | 'downright' | 'down' | 'downleft' | 'left' | 'upleft';
};

export const Arrow2: FC<Props> = ({ className, direction = 'right', ...rest }) => {
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
      viewBox="0 0 20 20"
      transform={`rotate(${degrees})`}
      className={className}
      {...rest}
    >
      <path d="M11.0774 3.57745C11.4029 3.25201 11.9305 3.25201 12.2559 3.57745L18.0893 9.41079C18.4147 9.73622 18.4147 10.2639 18.0893 10.5893L12.2559 16.4226C11.9305 16.7481 11.4029 16.7481 11.0774 16.4226C10.752 16.0972 10.752 15.5696 11.0774 15.2441L15.4882 10.8334H2.50002C2.03978 10.8334 1.66669 10.4603 1.66669 10C1.66669 9.5398 2.03978 9.16671 2.50002 9.16671H15.4882L11.0774 4.75596C10.752 4.43053 10.752 3.90289 11.0774 3.57745Z" />
    </svg>
  );
};
