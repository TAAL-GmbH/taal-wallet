const palette = {
  primary: {
    50: '#F3F4FB',
    100: '#E9EAF2',
    200: '#D3D4E2',
    300: '#C0C1D9',
    400: '#9095C0',
    500: '#5B619E',
    600: '#232D7C',
    700: '#1E276C',
    800: '#161D50',
  },
  secondary: {
    50: '#EDF7FE',
    100: '#E7F5FF',
    200: '#CDEAFF',
    300: '#B3DFFF',
    400: '#80C9FF',
    500: '#41AFFF',
    600: '#0094FF',
    700: '#0084E3',
    800: '#006BB0',
  },
  accent: {
    50: '#FFFCF1',
    100: '#FFF9E2',
    200: '#FFF4CE',
    300: '#FFEDAE',
    400: '#FFE27B',
    500: '#FFD53F',
    600: '#FFC700',
    700: '#FFBD3E',
    800: '#F2B33B',
  },
  grey: {
    50: '#F9F9F9',
    100: '#F5F4F4',
    200: '#EAEAEA',
    300: '#E0DFE2',
    400: '#CDCBD0',
    500: '#B3B0B8',
    600: '#8F8D94',
    700: '#65656D',
    800: '#282933',
  },
  neutral: {
    50: '#f7f9fa',
    100: '#f2f4f7',
    200: '#e8ecf1',
    300: '#e3e8ee',
    400: '#dee4eb',
    500: '#ced7e0',
    600: '#bfcad6',
    700: '#b0bdcb',
    800: '#a1b0c1',
    900: '#92a3b7',
  },
  success: {
    50: '#F4FFF5',
    100: '#DDF8DE',
    200: '#C4F2C6',
    300: '#ABE8AD',
    400: '#72D776',
    500: '#02C003',
    600: '#00AB01',
    700: '#00960A',
    800: '#008609',
  },
  danger: {
    50: '#FFF2F2',
    100: '#FFE6E7',
    200: '#FDCAD3',
    300: '#F5B3BB',
    400: '#F57D8B',
    500: '#F03B51',
    600: '#E8001C',
    700: '#D00019',
    800: '#BB0010',
  },
  white: '#FFFFFF',
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
      backgroundColor: palette.primary[600],
    },
    invert: {
      backgroundColor: 'white',
    },
    primary: {
      color: 'white',
      backgroundColor: palette.primary[600],
    },
    accent: {
      color: 'white',
      backgroundColor: palette.accent[600],
    },
    success: {
      color: 'white',
      backgroundColor: palette.success[600],
    },
    danger: {
      color: 'white',
      backgroundColor: palette.danger[600],
    },
    outline: {
      color: palette.primary[600],
      backgroundColor: 'transparent',
      border: `1px solid ${palette.primary[600]}`,
    },
  },
};

const grid = {
  gap: '16px',
};

const sharedComponents = {
  primaryColor: {
    light: palette.primary[400],
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
