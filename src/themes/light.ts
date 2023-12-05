const palette = {
  primary: {
    25: '#F1F4F8',
    50: '#F3F4FB',
    100: '#E9EAF2',
    200: '#D3D4E2',
    300: '#C0C1D9',
    400: '#9095C0',
    500: '#5B619E',
    600: '#232D7C',
    700: '#1E276C',
    800: '#161D50',
    A400: '#232D7C',
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
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  xxxl: '24px',
};

const fontSize = {
  xxs: '10px',
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
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
    xs: {
      height: '32px',
      borderRadius: '4px',
      typography: typography.heading6,
    },
    sm: {
      height: '40px',
      borderRadius: '4px',
      typography: typography.heading6,
    },
    md: {
      height: '48px',
      borderRadius: '4px',
      typography: typography.heading5,
    },
    lg: {
      height: '64px',
      borderRadius: '4px',
      typography: typography.heading5,
    },
  },
  variant: {
    default: {
      color: 'black',
      backgroundColor: palette.grey[300],
    },
    transparent: {
      color: palette.primary[600],
      backgroundColor: 'transparent',
    },
    invert: {
      backgroundColor: 'white',
    },
    primary: {
      color: 'white',
      backgroundColor: palette.primary[600],
    },
    accent: {
      color: palette.grey[800],
      backgroundColor: palette.accent[600],
      backgroundColorHover: palette.accent[800],
    },
    success: {
      color: 'white',
      backgroundColor: palette.success[600],
    },
    danger: {
      color: 'white',
      backgroundColor: palette.danger[600],
    },
  },
};

const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  lg: '0 6px 6px 0 rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

const animation = {
  fadeIn: `fadeInAnimation ease 1s;`,
  fadeInSlow: `fadeInAnimation ease 2s;`,
};

const grid = {
  gap: '16px',
};

const layout = {
  topNavBarHeight: '60px',
  contentMaxWidth: '1280px',
};

const light = {
  name: 'light',
  spacing,
  button,
  fontFamily,
  fontSize,
  typography,
  borderRadius,
  boxShadow,
  animation,
  layout,
  grid,
  color: {
    ...palette,
    error: palette.danger,
    bodyBgColor: palette.primary[25],
    contentBgColor: '#fff',
    // bodyBg: '#F3F4FB',
    // cardBg: '#fff',
    // formBg: palette.grey[50],
  },
  constant: {
    topNavBarHeight: '60px',
    bodyMinHeight: '700px',
    bodyMinHeightMobile: '525px',
    bodyMinWidth: '375px',
    contentMinHeightDesktop: '450px',
  },
};

export default light;
