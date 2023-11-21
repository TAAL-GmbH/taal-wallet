import light from '@/themes/light';
import 'styled-components';

type Light = typeof light;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Light {}
}
