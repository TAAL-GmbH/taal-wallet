import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { isUndefined } from '@/utils/generic';
import { injectSpacing } from '@/utils/injectSpacing';

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
  padding?: string | boolean;
  margin?: string | boolean;
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
      variant={variant}
      size={size}
      center={center}
      strong={strong}
      padding={
        // defaultVariant: user supplied padding value or false
        // otherVariant: user supplied padding value or ${size}
        isDefaultVariant && isUndefined(padding) ? false : padding || size
      }
      margin={isUndefined(margin) ? `${size} 0` : margin}
      className={className}
      hasIcon={!!icon}
    >
      {icon}
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<StyleProps & { hasIcon: boolean }>`
  ${p =>
    p.center &&
    css`
      text-align: center;
    `};

  ${p =>
    p.strong &&
    css`
      font-weight: bold;
    `};

  ${({ variant }) => {
    switch (variant) {
      case 'default': {
        // do nothing
        break;
      }

      case 'warning': {
        return css`
          color: #fff;
          background-color: ${p => p.theme.color.accent[300]};
          border-radius: ${p => p.theme.borderRadius.sm};
        `;
      }

      case 'error': {
        return css`
          color: #fff;
          background-color: ${p => p.theme.color.danger[400]};
          border-radius: ${p => p.theme.borderRadius.sm};
        `;
      }

      default: {
        return css`
          color: ${p => p.theme.color?.[variant]?.[700]};
          border: 1px solid ${p => p.theme.color?.[variant]?.[500]};
          background-color: ${p => p.theme.color?.[variant]?.[50]};
          border-radius: ${p => p.theme.borderRadius.sm};
        `;
      }
    }
  }}

  ${({ size }) =>
    size !== 'md' &&
    css`
      font-size: ${p => p.theme.fontSize[size]};
    `};

  ${({ hasIcon }) =>
    hasIcon &&
    css`
      display: flex;
      gap: 0.8rem;
      align-items: center;
    `};

  > svg {
    width: 2.5rem;
    height: 2.5rem;
  }

  ${injectSpacing(['margin', 'padding'])}
`;
