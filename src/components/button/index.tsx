import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { darken, math } from 'polished';
import { getAutoColor } from '@/utils/color';
// import { createMediaQueries } from '@/utils/create-media-queries';
import { injectSpacing } from '@/utils/injectSpacing';
import { TrackEventOptions } from 'src/types';
import { trackEvent } from '@/utils/tracking';
import { Spinner } from '../spinner';
// import { sharedAnchorStyles } from '../anchor-link/anchor-link';

export type ButtonStyleProps = {
  variant?:
    | 'default'
    | 'primary'
    | 'accent'
    | 'invert'
    | 'danger'
    | 'success'
    | 'link';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  hasDarkBg?: boolean;
  isDisabled?: boolean;
  margin?: boolean | string;
  noWrap?: boolean;
  width?: string | string[];
};

export type ButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  isDisabled?: boolean;
  margin?: boolean | string;
  noWrap?: boolean;
  trackEvent?: TrackEventOptions;
} & ButtonStyleProps;

export const Button: FC<ButtonProps> = ({
  onClick,
  children,
  type = 'button',
  isLoading = false,
  isDisabled = false,
  outline = false,
  variant = 'default',
  size = 'md',
  hasDarkBg = false,
  margin = false,
  noWrap = true,
  width,
  trackEvent: trackEventOptions,
}) => {
  const _onClick = () => {
    if (!isDisabled && !isLoading && typeof onClick === 'function') {
      onClick();
    }
    if (trackEventOptions) {
      trackEvent({
        category: 'button',
        action: 'click',
        ...trackEventOptions,
      });
    }
  };

  return (
    <ButtonStyled
      type={type}
      onClick={_onClick}
      isDisabled={isDisabled}
      variant={variant}
      size={size}
      outline={outline}
      hasDarkBg={hasDarkBg}
      margin={margin}
      noWrap={noWrap}
      width={width}
      isLoading={isLoading}
    >
      <span>{children}</span>
      {isLoading && <Spinner className="btn-spinner" size={size} />}
    </ButtonStyled>
  );
};

export const sharedButtonStyles = css<
  ButtonStyleProps & { isLoading: boolean }
>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rokkitt', serif;
  font-weight: bold;
  text-transform: uppercase;
  position: relative;
  cursor: pointer;

  // Button size;
  ${({ theme: { button }, size = 'md' }) => {
    const height = button.size[size].height;
    const paddingHorizontal = math(`${height} * 1.2`);
    const borderRadius =
      button.size[size].borderRadius || button.size.md.borderRadius;

    return css`
      height: ${height}; // used for flex-direction: row and display: block
      flex: 0 0 ${height}; // used for flex-direction: column
      padding: 0 ${paddingHorizontal};
      border-radius: ${borderRadius};
      font-size: ${button.size[size].fontSize};
    `;
  }};

  // Button variant;
  ${({ theme: { button }, variant = 'default', outline, hasDarkBg }) => {
    // get variant color or default color
    const color =
      button.variant[variant]?.color || button.variant.default.color;

    // get variant background color or default background color
    const bgColor =
      button.variant[variant]?.backgroundColor ||
      button.variant.default.backgroundColor;

    const hoverBgColor =
      button.variant[variant]?.backgroundColorHover || darken(0.15, bgColor);

    const border = button.variant[variant]?.border || 'none';

    if (outline) {
      return css`
        background-color: transparent;
        border: 2px solid ${bgColor};
        color: ${getAutoColor(bgColor, hasDarkBg)};

        &:hover {
          background-color: ${bgColor};
          color: ${color};
        }
      `;
    }

    return css`
      color: ${color};
      background-color: ${bgColor};
      border: ${border};

      &:hover {
        background-color: ${hoverBgColor};
      }
    `;
  }};

  ${({ noWrap }) =>
    noWrap &&
    css`
      white-space: nowrap;
    `};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      filter: saturate(0%) brightness(300%) contrast(50%);
      opacity: 0.8;
      :hover {
        cursor: not-allowed;
      }
    `};

  > span {
    ${({ isLoading }) =>
      isLoading &&
      css`
        visibility: hidden;
      `};
  }
  .btn-spinner {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  ${injectSpacing(['margin'])}
`;

const ButtonStyled = styled.button<ButtonStyleProps & { isLoading: boolean }>`
  ${({ variant }) =>
    variant === 'link'
      ? css`
          background: transparent;
          border: none;
          ${sharedAnchorStyles}
        `
      : sharedButtonStyles}
`;
