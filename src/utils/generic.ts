// import { ApiKey } from 'src/types';

export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined';

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNull = (value: unknown): value is null => value === null;

export const round = (value: number, precision = 0) => {
  return Number(Math.round(Number(value + 'e' + precision)) + 'e-' + precision);
};

export const objectPick = (obj: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));

export const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
