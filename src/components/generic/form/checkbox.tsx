import { FC, HTMLAttributes } from 'react';
import { useTheme } from 'styled-components';

type Props = {
  className?: string;
  isChecked?: boolean;
} & HTMLAttributes<HTMLOrSVGElement>;

export const Checkbox: FC<Props> = ({
  className,
  isChecked = true,
  ...rest
}) => {
  const theme = useTheme();

  console.log({ theme });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <path
        stroke={theme.color.primary[400]}
        strokeWidth="2"
        fill={isChecked ? theme.color.primary[400] : 'none'}
        d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"
      ></path>
      {isChecked && (
        <path
          transform="scale(0.8) translate(3,2)"
          d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
          fill="#fff"
        ></path>
      )}
    </svg>
  );
};
