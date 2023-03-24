import { mix } from 'polished';

type Keys = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';

export const buildColor = (c: Partial<Record<Keys, string>>): Record<Keys, string> => {
  return {
    50: c[50],
    100: c[100] || mix(0.8, c[50], c[400]),
    200: c[200] || mix(0.4, c[50], c[400]),
    300: c[300] || mix(0.2, c[50], c[400]),
    400: c[400],
    500: c[500] || mix(0.2, c[800], c[400]),
    600: c[600] || mix(0.4, c[800], c[400]),
    700: c[700] || mix(0.6, c[800], c[400]),
    800: c[800] || mix(0.8, c[800], c[400]),
  };
};
