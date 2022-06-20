import { buildColor } from '@/utils/build-color';
import { lighten, darken, setSaturation } from 'polished';

const primary = '#232d7c';
const primaryA = '#48C1FF';
const accent = '#e99536';
const accentA = '#ff8800';
const neutral = '#dee4eb';
const neutralA = '#97b6dd';
const grey = '#76747c';
const success = '#68C17C';
const successA = '#2aff58';
const danger = '#b80357';
const dangerA = '#ff05b4';

const palette = {
  primary: buildColor({
    50: lighten(0.6, primary),
    400: primary,
    900: darken(0.1, primary),
    A400: primaryA,
  }),
  accent: buildColor({
    50: lighten(0.4, accent),
    400: accent,
    900: darken(0.3, setSaturation(1, accent)),
    A400: accentA,
  }),
  neutral: buildColor({
    50: lighten(0.08, neutral),
    400: neutral,
    900: darken(0.25, setSaturation(0.2, neutral)),
    A400: neutralA,
  }),
  grey: buildColor({
    50: '#F5F5F5',
    100: '#efefef',
    400: grey,
    900: darken(0.25, setSaturation(0.2, grey)),
    A400: grey,
  }),
  success: buildColor({
    50: lighten(0.35, success),
    400: success,
    900: darken(0.25, setSaturation(0.2, success)),
    A400: successA,
  }),
  danger: buildColor({
    50: lighten(0.6, danger),
    400: danger,
    900: darken(0.2, setSaturation(0.6, danger)),
    A400: dangerA,
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
  },
};

const fontFamily = {
  primary: 'Roboto, sans-serif',
  secondary: 'Roboto, serif',
  heading: 'Roboto, serif',
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
  borderRadius,
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
