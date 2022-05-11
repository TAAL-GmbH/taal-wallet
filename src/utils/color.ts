import { getContrast, darken, lighten } from 'polished';

export const getAutoColor = (color: string, hasDarkBg: boolean) => {
  const compared = hasDarkBg ? 'black' : 'white';

  // https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
  const contrastRatio = getContrast(compared, color);

  // if color pair has AA contrast ratio (>=4.5:1)
  if (contrastRatio >= 4.5) {
    return color;
  }

  const ratio = contrastRatio < 2 ? 0.6 : 0.1;

  return hasDarkBg ? lighten(ratio, color) : darken(ratio, color);
};
