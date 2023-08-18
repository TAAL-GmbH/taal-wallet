import { css } from 'styled-components';

export const bp = {
  desktop: (...args: Parameters<typeof css>) => {
    return css`
      @media (min-width: 1280px) {
        ${css(...args)}
      }
    `;
  },
  tablet: (...args: Parameters<typeof css>) => {
    return css`
      @media (min-width: 768px) {
        ${css(...args)}
      }
    `;
  },
  mobile: (...args: Parameters<typeof css>) => {
    return css`
      @media (max-width: 768px) {
        ${css(...args)}
      }
    `;
  },
  custom:
    (min: string | number | null, max?: string | number) =>
    (...args: Parameters<typeof css>) => {
      const rules = [];

      if (min) {
        rules.push(`(min-width: ${min})`);
      }
      if (max) {
        rules.push(`(max-width: ${max})`);
      }

      if (rules.length === 0) {
        throw new Error('No min or max provided');
      }

      const result = css`
        @media ${rules.join(' and ')} {
          ${css(...args)}
        }
      `;
      return result;
    },
};
