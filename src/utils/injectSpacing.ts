import { DefaultTheme } from 'styled-components';

type Props = {
  theme: DefaultTheme;
  margin?: boolean | string;
  padding?: boolean | string;
};

export const injectSpacing = (keys: string[]) => {
  return (props: Props) => {
    const styles = keys.map(key => {
      const value: boolean | string = props[key] || false;
      if (typeof value === undefined || !value) {
        return undefined;
      }
      const parts = value === true ? ['md'] : value.split(' ');
      const values = parts.map(value => props.theme.spacing[value] || value);

      return `${key}: ${values.join(' ')}`;
    });
    return `${styles.join(';')};`;
  };
};
