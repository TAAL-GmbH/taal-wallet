import { DefaultTheme } from 'styled-components';

type Props = {
  theme: DefaultTheme;
  margin?: boolean | string;
  padding?: boolean | string;
};

export const injectSpacing = (keys: string[]) => {
  return (props: Props) => {
    const styles = keys.map(key => {
      // TODO: fix TS error
      // @ ts-expect-error
      const value: boolean | string = props[key] || false;
      if (typeof value === undefined || !value) {
        return undefined;
      }
      const parts = value === true ? ['md'] : value.split(' ');
      // TODO: fix TS error
      // @ ts-expect-error
      const values = parts.map(value => props.theme.spacing[value] || value);

      return `${key}: ${values.join(' ')}`;
    });
    return `${styles.join(';')};`;
  };
};

export const margin = (val: string | TemplateStringsArray) => (props: { theme: DefaultTheme }) =>
  injectSpacing(['margin'])({
    theme: props.theme,
    margin: Array.isArray(val) ? val[0] : val,
  });

export const padding = (val: string | TemplateStringsArray) => (props: { theme: DefaultTheme }) =>
  injectSpacing(['padding'])({
    theme: props.theme,
    padding: Array.isArray(val) ? val[0] : val,
  });
