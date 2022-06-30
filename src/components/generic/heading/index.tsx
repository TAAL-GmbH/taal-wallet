import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  cta?: ReactNode;
  className?: string;
};

export const Heading: FC<Props> = ({ className, children, icon, cta }) => {
  return (
    <Wrapper className={className}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <h1>{children}</h1>
      {cta && <CtaWrapper>{cta}</CtaWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem 0.2rem;

  h1 {
    margin: 0.6rem 0 0;
    flex-grow: 1;
  }

  button {
    margin-top: 0.4rem;
    max-height: 1.4rem;
    max-width: 1.4rem;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.color.neutral[800]};

    svg {
      fill: #fff;
    }
  }
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

const CtaWrapper = styled.div``;
