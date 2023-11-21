import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { InjectSpacing } from '@/types';
import { injectSpacing } from '@/utils/inject-spacing';

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  cta?: ReactNode;
  level?: number;
  className?: string;
  margin?: string;
  center?: boolean;
};

export const Heading: FC<Props> = ({
  className,
  children,
  icon,
  cta,
  level = 3,
  margin = 'md 0 sm',
  center = false,
}) => {
  const headingTag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Wrapper className={className} $margin={margin} $center={center}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <HeadingStyled as={headingTag} $level={level}>
        {children}
      </HeadingStyled>
      {cta && <span>{cta}</span>}
    </Wrapper>
  );
};

const HeadingStyled = styled.h1<{
  $level?: number;
  as: keyof JSX.IntrinsicElements;
  $center?: boolean;
}>`
  ${({ theme, $level }) => `${theme.typography[`heading${$level}`]}`};
  margin: 0;

  ${({ $center }) => $center && 'text-align: center;'}
`;

const Wrapper = styled.div<InjectSpacing & { $center?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  ${({ theme }) => theme.typography.body1};
  ${({ $center }) => $center && 'justify-content: center;'}

  button {
    max-height: 1.4rem;
    max-width: 1.4rem;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.color.accent[600]};

    svg {
      fill: #fff;
    }
  }

  ${injectSpacing(['margin', 'padding'])}
`;

const IconWrapper = styled.div`
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.accent[400]};
  width: 2rem;
  height: 2rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: #fff;
  }
`;
