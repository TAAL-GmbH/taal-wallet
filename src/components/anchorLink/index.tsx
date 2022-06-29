import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
};

export const AnchorLink: FC<Props> = ({ className, children, href: hrefRaw, onClick }) => {
  const _onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hrefRaw === '#') {
      e.preventDefault();
    }
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  const href = hrefRaw.startsWith('#') ? hrefRaw : `#${hrefRaw}`;
  return (
    <A className={className} href={href} onClick={_onClick}>
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
