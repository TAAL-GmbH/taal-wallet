import { buildColor } from '@/utils/build-color';
import { lighten, darken, setSaturation } from 'polished';

const primary = '#232d7c';
const accent = '#e99536';
const neutral = '#dee4eb';
const grey = '#76747c';
const success = '#68C17C';
const danger = '#b80357';

const palette = {
  primary: buildColor({
    50: lighten(0.6, primary),
    400: primary,
    800: darken(0.1, primary),
  }),
  accent: buildColor({
    50: lighten(0.4, accent),
    400: accent,
    800: darken(0.3, setSaturation(1, accent)),
  }),
  neutral: buildColor({
    50: lighten(0.08, neutral),
    400: neutral,
    800: darken(0.25, setSaturation(0.2, neutral)),
  }),
  grey: buildColor({
    50: '#F5F5F5',
    100: '#efefef',
    400: grey,
    800: darken(0.25, setSaturation(0.2, grey)),
  }),
  success: buildColor({
    50: lighten(0.35, success),
    400: success,
    800: darken(0.25, setSaturation(0.2, success)),
  }),
  danger: buildColor({
    50: lighten(0.6, danger),
    400: danger,
    800: darken(0.2, setSaturation(0.6, danger)),
  }),
};

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

const borderRadius = {
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  xxl: spacing.xxl,
};

const fontSize = {
  sm: '0.8rem',
  md: '1rem',
  lg: '1.1rem',
  xl: '1.4rem',
  xxl: '2rem',
  xxxl: '4rem',
};

const button = {
  size: {
    sm: {
      height: spacing.lg,
      fontSize: '11px',
      borderRadius: '2px',
    },
    md: {
      height: spacing.xl,
      fontSize: '13px',
      borderRadius: '4px',
    },
    lg: {
      height: spacing.xxl,
      fontSize: '15px',
      borderRadius: '6px',
    },
  },
  variant: {
    default: {
      color: 'black',
      backgroundColor: palette.neutral[400],
    },
    invert: {
      backgroundColor: 'white',
    },
    primary: {
      color: 'white',
      backgroundColor: palette.primary[400],
    },
    accent: {
      color: 'white',
      backgroundColor: palette.accent[400],
    },
    success: {
      color: 'white',
      backgroundColor: palette.success[400],
    },
    danger: {
      color: 'white',
      backgroundColor: palette.danger[400],
    },
    outline: {
      color: palette.primary[400],
      backgroundColor: 'transparent',
      border: `1px solid ${palette.primary[400]}`,
    },
  },
};

const fontFamily = {
  primary: "'Inter', sans-serif",
  secondary: "'Inter', sans-serif",
  heading: "'Inter', sans-serif",
  monospace: "'JetBrains Mono', monospace", // todo: add font
};

const typography = {
  display1: `
    font-size: 72px;
  `,
  display2: `
    font-size: 60px;
  `,
  display3: `
    font-size: 32px;
  `,
  heading1: `
    font-size: 48px;
    font-weight: 600;
  `,
  heading2: `
    font-size: 32px;
    font-weight: 600;
  `,
  heading3: `
    font-size: 24px;
    font-weight: 600;
  `,
  heading4: `
    font-size: 18px;
    font-weight: 600;
  `,
  heading5: `
    font-size: 16px;
    font-weight: 600;
  `,
  heading6: `
    font-size: 14px;
    font-weight: 600;
  `,
  heading7: `
    font-size: 12px;
    font-weight: 600;
  `,
  heading8: `
    font-size: 10px;
    font-weight: 600;
  `,
  heading9: `
    font-size: 9px;
    font-weight: 600;
  `,
  body1: `
    font-size: 18px;
  `,
  body2: `
    font-size: 16px;
  `,
  body3: `
    font-size: 14px;
  `,
  body4: `
    font-size: 12px;
  `,
  numeric1: `
    font-family: ${fontFamily.monospace};
    font-size: 16px;
  `,
  numeric2: `
    font-family: ${fontFamily.monospace};
    font-size: 14px;
  `,
  numeric3: `
    font-family: ${fontFamily.monospace};
    font-size: 12px;
  `,
};

const grid = {
  gap: '16px',
};

const sharedComponents = {
  primaryColor: {
    light: primary[400],
  },
  input: {
    label: palette.grey[600],
    error: palette.danger[400],
    border: 'rgba(0, 0, 0, 0)',
    borderFocus: palette.grey[100],
  },
};

const light = {
  name: 'light',
  spacing,
  button,
  fontFamily,
  fontSize,
  typography,
  borderRadius,
  grid,
  color: {
    ...palette,
    error: palette.danger,
    bodyColor: '#56555A',
    bodyBg: '#F8F8F8',
    cardBg: '#fff',
    formBg: palette.grey[50],
  },
  ...sharedComponents, // navyBlue: '#004070',
};

export default light;
