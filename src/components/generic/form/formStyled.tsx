import { injectSpacing } from '@/src/utils/injectSpacing';
import styled, { css } from 'styled-components';
import { IconButton } from '../icon-button';

export type StyledInput = {
  inputSize?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
  hasDarkBg?: boolean;
  labelOnLeft?: boolean;
  isCustomEl?: boolean;
};

export const LabelText = styled.div`
  font-size: 0.9rem;
`;

export const Required = styled.span`
  color: ${({ theme }) => theme.color.danger[400]};
`;

export const InputElWrapper = styled.div<{ isCustomEl: boolean }>`
  display: flex;
  align-items: center;
  position: relative;

  ${({ isCustomEl }) =>
    isCustomEl
      ? css`
          padding: 0.4rem;

          &:focus-within {
            border-radius: 50%;
            background-color: var(--focusColor);
          }
        `
      : css`
          margin: 0;
        `}
`;

export const sharedInput = css<StyledInput & { ctaCount?: number }>`
  width: ${({ labelOnLeft }) => (labelOnLeft ? 'auto' : '100%')};
  outline: none;
  border-radius: 0.25rem;
  padding: 0.8rem;
  padding-right: ${({ ctaCount }) => (ctaCount ? `${ctaCount * 1.5}rem` : '0.8rem')};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  appearance: none;
  color: ${({ theme }) => theme.color.grey[600]};

  ${({ isCustomEl }) =>
    isCustomEl &&
    css`
      border: 0;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      white-space: nowrap;
      outline: 0;
      -webkit-appearance: none;
    `}

  ${({ hasError, theme }) =>
    hasError
      ? css`
          background-color: ${theme.color.danger[50]} !important;
          border: 1px solid var(--errorColor);
        `
      : css`
          border: 1px solid ${({ theme }) => theme.color.neutral[200]};
        `};

  ${({ inputSize, theme }) => {
    switch (inputSize) {
      case 'sm':
        return css`
          font-size: ${theme.fontSize.sm};
          margin: 0.4rem 0;
          padding-top: 0.4rem;
          padding-bottom: 0.4rem;
        `;
      case 'lg':
        return css`
          font-size: ${theme.fontSize.lg};
        `;
      default:
        return css`
          font-size: calc(${theme.fontSize.md} * 0.8);
        `;
    }
  }};

  &::placeholder {
    color: ${({ theme }) => theme.color.grey[200]};
  }
`;

export const FormWrapper = styled.div`
  background-color: ${props => props.theme.color.grey[50]};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: 0.4rem;

  ${injectSpacing(['padding'])}
`;

export const FormFieldCtaWrapper = styled.div`
  position: absolute;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  pointer-events: none;
`;

export const FormFieldActionButton = styled(IconButton)`
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  pointer-events: all;

  svg {
    opacity: 0.5;
  }
`;
