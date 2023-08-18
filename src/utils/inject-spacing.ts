import { DefaultTheme } from 'styled-components';

type Props = {
  theme: DefaultTheme;
  $margin?: string;
  $padding?: string;
  $gap?: string;
};

type Key = 'padding' | 'margin' | 'gap';

export const injectSpacing = (keys: Key[]) => {
  return (props: Props) => {
    const styles = keys.map(key => {
      const value: string | false = props[`$${key}`] || false;
      if (typeof value === undefined || !value) {
        return undefined;
      }
      const parts = value.split(' ');
      const values = parts.map(value => props.theme.spacing[value] || value);

      return `${key}: ${values.join(' ')}`;
    });
    return `${styles.join(';')};`;
  };
};

export const margin = (val: string | TemplateStringsArray) => (props: { theme: DefaultTheme }) =>
  injectSpacing(['margin'])({
    theme: props.theme,
    $margin: Array.isArray(val) ? val[0] : val,
  });

export const padding = (val: string | TemplateStringsArray) => (props: { theme: DefaultTheme }) =>
  injectSpacing(['padding'])({
    theme: props.theme,
    $padding: Array.isArray(val) ? val[0] : val,
  });

export const gap = (val: string | TemplateStringsArray) => (props: { theme: DefaultTheme }) =>
  injectSpacing(['gap'])({
    theme: props.theme,
    $gap: Array.isArray(val) ? val[0] : val,
  });
