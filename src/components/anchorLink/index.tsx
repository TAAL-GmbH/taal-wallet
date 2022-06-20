import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: () => void;
};

export const AnchorLink: FC<Props> = ({
  className,
  children,
  href: hrefRaw,
  onClick,
}) => {
  const href = hrefRaw.startsWith('#') ? hrefRaw : `#${hrefRaw}`;
  return (
    <A className={className} href={href} onClick={onClick}>
      {children}
    </A>
  );
};

const A = styled.a`
  color: ${({ theme }) => theme.color.primary.A700};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
