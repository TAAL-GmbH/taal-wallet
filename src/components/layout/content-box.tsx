import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { injectSpacing, padding } from '@/utils/inject-spacing';
import { InjectSpacing } from '@/types';
import { bp } from '@/utils/breakpoints';
import { ContentHeader } from '@/components/header/content-header';

type Props = {
  className?: string;
  showBackButton?: boolean;
  padding?: string;
  center?: boolean;
  vcenter?: boolean;
  children: ReactNode;
  header?: ReactNode;
  maxWidth?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ContentBox: FC<Props> = ({
  children,
  className,
  showBackButton = true,
  center = false,
  vcenter = false,
  padding,
  header = null,
  maxWidth,
  ...rest
}) => {
  return (
    <Wrapper className={className} $padding={padding} {...rest}>
      {header && <ContentHeader showBackButton={showBackButton}>{header}</ContentHeader>}
      <InnerWrapper
        className="inner-wrapper"
        $maxWidth={maxWidth}
        $hasHeader={!!header}
        $center={center}
        $vcenter={vcenter}
      >
        {children}
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.main<InjectSpacing>`
  background-color: ${({ theme }) => theme.color.contentBgColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  position: relative;

  ${bp.desktop`
    ${padding`lg xl`};
  `};

  ${bp.mobile`
    ${padding`lg md`};
  `};

  ${padding`lg md`};

  ${injectSpacing(['padding'])};
`;

const InnerWrapper = styled.div<{
  $maxWidth?: string;
  $hasHeader: boolean;
  $center?: boolean;
  $vcenter?: boolean;
}>`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  ${({ $maxWidth }) =>
    $maxWidth
      ? css`
          max-width: ${$maxWidth};
        `
      : css`
          max-width: 352px;

          ${bp.tablet`
            max-width: 432px;
          `};
          ${bp.desktop`
            max-width: 432px;
          `};
        `};

  ${({ $center }) => $center && `align-items: center;`}
  ${({ $vcenter }) => $vcenter && `justify-content: center;`}

  ${({ $hasHeader }) =>
    $hasHeader &&
    css`
      margin-top: ${({ theme }) => theme.spacing.xl};
    `};

  ${bp.desktop`
      min-height: ${({ theme }) => theme.constant.contentMinHeightDesktop};
  `};

  ${bp.tablet`
      min-height: ${({ theme }) => theme.constant.contentMinHeightDesktop};
  `};
`;
