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
      fontSize: '14px',
      borderRadius: '2px',
    },
    md: {
      height: spacing.xl,
      fontSize: '16px',
      borderRadius: '4px',
    },
    lg: {
      height: spacing.xxl,
      fontSize: '18px',
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
  // bodyBg: 'white',
  // bodyFontColor: '#282933cc',
  // headerBg: '#1e4c88', // primaryColor main
  // megaMenu: '#1e4c88',
  // footerBg: '#0d122e', // primaryColor mediumDark
  // invertBlack: '#000000', // false
  // invertWhite: '#ffffff', // false
  // backdrop: 'rgba(0, 0, 0, 0.6)',
  // backdropLight: 'rgba(0, 0, 0, 0.2)',

  // primaryColor: {
  //   highlight: '#eb3581', // '#551aff', //'#4017B5',
  //   // lightText: '#928cb3',
  //   light: '#48C1FF', // purple light
  //   medium: '#05c', // '#4D41AA', // '#2d333b',
  //   main: '#242d7c', // '#332D62', // purple
  //   mediumDark: '#201C3C', // '#201C3C', // BgFooter
  //   dark: '#080437', // '#080437',
  //   contrastText: '#FFFFFF',
  //   contrastTextDark: '#332D62', // purple text strong
  // },
  // secondary: {
  //   light: '#ffec4d',
  //   medium: '#ffec4d',
  //   main: '#FBBA00', // yellow 500
  //   dark: '#c38a00',
  //   contrastText: '#000000',
  // },
  // tertiary: {
  //   light: '#9a9dbf',
  //   medium: '#8f93ca',
  //   main: '#605690', // primaryDark custom
  //   dark: '#080437',
  //   contrastText: '#FFFFFF',
  // },
  // textColor: {
  //   main: 'rgba(40, 41, 51, 0.8)', // '#0b2239',
  //   medium: 'rgba(0,0,0,0.60)',
  //   light: 'rgba(255,255,255,0.60)', // Always white on light or dark
  //   disabled: 'rgba(0,0,0,0.38)',
  //   header: '#FFFFFF', // Header
  //   headings: '#242d7c', // Primary Color
  //   link: '#5793db', // '#1184dc', // '#1890ff', // '#007bff', // #5793db',
  //   linkHover: '#9e9e9e', // Blocklist
  //   warning: '#ffc107',
  //   whiteLight: 'rgba(255,255,255,0.38)', // Rows for Colored BG
  //   whiteMedium: 'rgba(255,255,255,0.60)', // Rows for Colored BG
  //   whiteDark: 'rgba(255,255,255,0.87)', // Rows for Colored BG
  //   defaultMain: '#212121', // same color is on dark and Light theme
  //   defaultPrimary: '#1e4c88', // same color is on dark and Light theme
  //   defaultPrimaryLight: '#A49FBF', // same color is on dark and Light theme
  // },
  // label: {
  //   primary: '#9e9e9e', // disabled text on dark theme
  //   primaryLight: '#9e9e9e', // light text on dark theme
  //   light: 'rgba(0,0,0,0.38)', // Blocklist
  // },
  // button: {
  //   text: '#fff',
  //   primary: '#232d7c', // Navy Blue Primary
  //   primaryBorder: '#232d7c',
  //   secondary: '#48C1FF',
  //   disabledText: '#9e9e9e',
  //   disabled: '#cccbd8',
  //   light: '#dbdbdb',
  //   checkout: 'greenlight',
  //   linkHover: '#9e9e9e', // Blocklist
  // },
  // btnHover: {
  //   primary: '#05c', // Blue Medium - Taal color Brand
  //   primaryBorder: '#05c',
  //   secondary: '#FFFFFF',
  //   disable: 'aqua',
  //   light: '#9e9e9e', // Blocklist
  //   checkout: 'green',
  //   linkHover: '#9e9e9e', // Blocklist
  // },
  // grey: {
  //   textLight: '#949494',
  //   textMedium: '#9397bd',
  //   medium: '#B2B2B2', // medium grey light
  //   bgLight: '#F6F6F8', // Vin Vout Inputs Outputs
  //   bgMedium: '#EAE6EC',
  //   50: '#fafafa',
  //   100: '#f5f5f5',
  //   200: '#eeeeee', // medium grey light
  //   300: '#e0e0e0',
  //   400: '#bdbdbd',
  //   500: '#9e9e9e',
  //   600: '#757575', // medium grey light
  //   700: '#616161',
  //   800: '#424242',
  //   900: '#212121',
  // },
  // black: '#000000',
  // white: '#FFFFFF',
  // text: '#212121',
  // borderColor: {
  //   header: '#4F1DE1',
  //   white: 'rgba(255,255,255,0.15)',
  //   main: '#E5E8F0',
  //   light: '#f1f1f1', // Blocks slider
  //   dark: '#d3d6de',
  //   highlight: '#FBBA00', // Latest Block Slider
  // },
  // bg: {
  //   primary: '#F6F6F8', // BG Main Pages
  //   secondary: 'rgba(0,29,111,0.08)', // Dark transparent Search Bar Row
  //   inserts: '#9397bd',
  //   solid: '#15193c',
  //   light: '#ffffff', // Box Card, AccordionDetails
  //   medium: '#10122b',
  //   dark: '#0e0e23',
  //   grey: 'rgba(0,29,111,0.08)', // Tabs Blocks page Tx components
  //   accordionOut: '#ffffff',
  //   accordionIn: '#ffffff',
  //   accordionInOpen: '#ffffff',
  //   colored: '#1a3252', // 'radial-gradient(circle closest-corner at 50% 50%,#47cdf9,#265ea7 64%)'
  // },
  // textLight_1: '#A49FBF', // purple light
  // textLight_2: '#B2B2B2', // medium grey light
  // gradient2: 'linear-gradient(left, #8f6B29, #FDE08D, #DF9F28)',
  // gradient: {
  //   primary: 'linear-gradient(90deg, #242d7c, #414996)',
  //   main: 'linear-gradient(180deg, #6B50BA, #4017B5)',
  //   bgRadial: 'linear-gradient(#ffffff, #f5f5fa)',
  //   bgLight: 'linear-gradient(rgb(255, 255, 255), rgb(232 232 239))',
  //   secondary: 'linear-gradient(180deg, #FBBA00, #ffcd3e)',
  //   secondaryLight: 'linear-gradient(#ffffff 40%,#fff6db)',
  //   secondaryMedium:
  //     'radial-gradient(100% 100% at 100% 0%, #ffe7a2 0%, #FBBA00 100%)',
  //   // delete below
  //   bgLinearGrey:
  //     'radial-gradient(circle farthest-corner at 100% 0%, #4c84ff, #254cdd)',
  //   bgLinearGrey2: 'linear-gradient(220deg,#a5c0de 0%,#9a9dbf 60%)',
  //   bgLinear: 'linear-gradient(325deg, #1a1d3a 0%, #212752 100%)',
  //   star: 'linear-gradient(45deg,#081e21,#572fbe 60%,#5636a7 80%)',
  // },
  // focus: {
  //   buttons: 'rgba(154,205,50, 0.3)',
  // },
  // input: {
  //   label: '#8d8c9d', // '#cccbd8',
  //   text: 'rgba(0,0,0,0.87)',
  //   bg: '#ffffff', // Also textArea #cccbd84d
  //   bgFocus: '#48c1ff1a', // blue light
  //   bgLoading: 'rgba(255,255,255,0.8)',
  //   border: 'rgba(36, 28, 21, 0.3)',
  //   borderFocus: '#48C1FF', // Blue light - Taal color Brand
  //   error: '#eb3581',
  //   errorBg: '#eb35811a',
  // },
  // success: '#7FB830', // green
  // warning: '#ffc107', // yellow
  // danger: '#dc3545', // red
  // info: '#17a2b8', // blue-green-light //'#007bff', //blue-light
  // tooltip: {
  //   bgColor: '#c1bfcc',
  //   textColor: '#0b2239', // '#212121',
  //   link: '#0079d6',
  //   linkHover: '#0250bb',
  // },
  // contained: {
  //   xl: '1800px',
  //   lg: '1600px',
  //   md: '1200px',
  //   sm: '900px',
  //   xs: '600px',
  // },
  // colored: {
  //   purple: '#690cff',
  //   green: '#65b765',
  // },
  // zIndex: {
  //   highest: 10000,
  //   vhigh: 9990,
  //   high: 999,
  //   low: 100,
  // },
};

export default light;
