import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { isUndefined } from '@/utils/generic';
import { injectSpacing } from '@/utils/inject-spacing';

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

type StyleProps = {
  variant?: 'default' | 'primary' | 'accent' | 'grey' | 'warning' | 'danger' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  center?: boolean;
  strong?: boolean;
  padding?: string;
  margin?: string;
};

export const Note: FC<Props & StyleProps> = ({
  variant = 'default',
  size = 'md',
  center = false,
  strong = false,
  padding,
  margin,
  children,
  icon,
  className,
}) => {
  const isDefaultVariant = variant === 'default';
  return (
    <Wrapper
      $variant={variant}
      $size={size}
      $center={center}
      $strong={strong}
      $padding={
        // defaultVariant: user supplied padding value or false
        // otherVariant: user supplied padding value or ${size}
        isDefaultVariant && isUndefined(padding) ? null : padding || size
      }
      $margin={isUndefined(margin) ? `${size} 0` : margin}
      className={className}
      $hasIcon={!!icon}
    >
      {icon}
      {children}
    </Wrapper>
  );
};

type WrapperProps = {
  $variant?: StyleProps['variant'];
  $size?: StyleProps['size'];
  $center?: StyleProps['center'];
  $strong?: StyleProps['strong'];
  $padding?: StyleProps['padding'];
  $margin?: StyleProps['margin'];
  $hasIcon: boolean;
};

const Wrapper = styled.div<WrapperProps>`
  ${({ theme }) => theme.typography.body3};
  border-radius: ${p => p.theme.borderRadius.sm};

  ${p =>
    p.$center &&
    css`
      text-align: center;
    `};

  ${p =>
    p.$strong &&
    css`
      font-weight: bold;
    `};

  ${({ $variant }) => {
    switch ($variant) {
      case 'default': {
        return css`
          color: ${p => p.theme.color.grey[800]};
          background-color: ${p => p.theme.color.secondary[50]};
          border: 1px solid ${p => p.theme.color.secondary[600]};

          svg {
            fill: ${p => p.theme.color.secondary[600]};
          }
        `;
        break;
      }

      case 'warning': {
        return css`
          color: #fff;
          background-color: ${p => p.theme.color.accent[800]};
        `;
      }

      case 'error': {
        return css`
          color: #fff;
          background-color: ${p => p.theme.color.danger[400]};
        `;
      }

      case 'accent': {
        return css`
          color: #fff;
          background-color: ${p => p.theme.color.accent[600]};
        `;
      }

      default: {
        return css`
          color: ${p => p.theme.color?.[$variant]?.[800]};
          border: 1px solid ${p => p.theme.color?.[$variant]?.[800]};
          background-color: ${p => p.theme.color?.[$variant]?.[50]};
          border-radius: ${p => p.theme.borderRadius.sm};
        `;
      }
    }
  }}

  ${({ $size }) =>
    $size !== 'md' &&
    css`
      font-size: ${p => p.theme.fontSize[$size]};
    `};

  ${({ $hasIcon }) =>
    $hasIcon &&
    css`
      display: flex;
      gap: 0.8rem;
      align-items: center;
    `};

  > svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  ${injectSpacing(['margin', 'padding'])}
`;
