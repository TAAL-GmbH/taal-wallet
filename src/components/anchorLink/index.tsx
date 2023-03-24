import { useHashLocation } from '@/src/hooks/useHashLocation';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
};

export const AnchorLink: FC<Props> = ({ className, children, href: hrefRaw, onClick }) => {
  const [location] = useHashLocation();

  const _onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hrefRaw === '#') {
      e.preventDefault();
    }
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  const href = hrefRaw.startsWith('#') ? hrefRaw : `#${hrefRaw}`;
  const classNames = [className, `#${location}` === href ? 'active' : false].filter(Boolean).join(' ');

  return (
    <A className={classNames} href={href} onClick={_onClick}>
      {children}
    </A>
  );
};

const A = styled.a`
  color: ${({ theme }) => theme.color.primary[700]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
