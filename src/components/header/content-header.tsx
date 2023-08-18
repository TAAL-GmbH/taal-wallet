import { FC, ReactNode } from 'react';
import { styled } from 'styled-components';

import { bp } from '@/utils/breakpoints';

import { Arrow } from '@/svg/arrow';
import { IconButton } from '@/generic/icon-button';

type Props = {
  className?: string;
  showBackButton?: boolean;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const ContentHeader: FC<Props> = ({ className, showBackButton = true, children }) => {
  return (
    <Wrapper className={className}>
      {showBackButton && (
        <BackButton onClick={() => history.go(-1)}>
          <Arrow direction="left" />
        </BackButton>
      )}
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  justify-content: stretch;
  ${({ theme }) => theme.typography.heading5};

  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};

  ${bp.mobile`
    left: ${({ theme }) => theme.spacing.md};
    right: ${({ theme }) => theme.spacing.md};
  `};

  :nth-child(2) {
    place-self: center;
    white-space: nowrap;
    color: ${({ theme }) => theme.color.primary[600]};
    text-align: center;
  }
  :nth-child(3) {
    place-self: flex-end;
  }
`;

const BackButton = styled(IconButton)`
  svg {
    width: 24px;
    color: ${({ theme }) => theme.color.primary[600]};
  }
`;
