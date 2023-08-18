import styled, { css } from 'styled-components';

import { injectSpacing, padding } from '@/utils/inject-spacing';
import { IconButton } from '@/generic/icon-button';

export type StyledInput = {
  $inputSize?: 'sm' | 'md' | 'lg';
  $hasError?: boolean;
  $hasDarkBg?: boolean;
};

export const LabelText = styled.div`
  ${({ theme }) => theme.typography.heading6};
`;

export const Required = styled.span`
  color: ${({ theme }) => theme.color.grey[600]};
`;

export const InputElWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;
`;

export const sharedInput = css<StyledInput & { ctaCount?: number }>`
  outline: none;
  border-radius: 0.25rem;
  height: 48px;
  box-sizing: border-box;
  padding-right: ${({ ctaCount }) => (ctaCount ? `${ctaCount * 1.5}rem` : '0.8rem')};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  appearance: none;
  color: ${({ theme }) => theme.color.grey[800]};
  width: 100%;
  ${padding`xs md`};

  ${({ $hasError }) =>
    $hasError
      ? css`
          border: 1px solid var(--errorColor);
        `
      : css`
          border: 1px solid ${({ theme }) => theme.color.grey[200]};
        `};

  ${({ $inputSize, theme }) => {
    switch ($inputSize) {
      case 'sm':
        return css`
          ${theme.typography.body4};
          margin: 0.4rem 0;
          padding-top: 0.4rem;
          padding-bottom: 0.4rem;
        `;
      case 'lg':
        return css`
          ${theme.typography.body2};
        `;
      default:
        return css`
          ${theme.typography.body3};
        `;
    }
  }};

  &::placeholder {
    color: ${({ theme }) => theme.color.grey[600]};
  }
`;

export const sharedUnits = css`
  position: absolute;
  pointer-events: none;
  opacity: 0.4;
  margin-left: 22px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.typography.heading7};
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
  width: 20px;
  height: 20px;
  pointer-events: all;

  svg {
    fill: ${({ theme }) => theme.color.grey[500]};
  }
`;
