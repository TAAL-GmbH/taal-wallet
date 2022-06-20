import { FC, HTMLAttributes } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = {
  className?: string;
  isChecked?: boolean;
} & HTMLAttributes<HTMLOrSVGElement>;

export const Radio: FC<Props> = ({ className, isChecked = true, ...rest }) => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <Outer
        stroke={theme.color.primary[400]}
        strokeWidth="2"
        fill="none"
        cx="12"
        cy="12"
        r="8"
      />
      {isChecked && <Inner cx="12" cy="12" r="5" />}
    </svg>
  );
};

const Outer = styled.circle`
  stroke: var(--primaryColor);
`;

const Inner = styled.circle`
  fill: var(--primaryColor);
`;
