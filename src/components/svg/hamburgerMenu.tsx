import { FC } from 'react';

export const HamburgerMenuIcon: FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="m12 20h40v2h-40z" />
    <path d="m12 32h40v2h-40z" />
    <path d="m12 44h40v2h-40z" />
  </svg>
);
