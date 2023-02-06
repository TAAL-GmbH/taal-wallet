// import { ApiKey } from 'src/types';

export const isBackgroundScript = () => typeof window === 'undefined';

export const isPopup = () =>
  typeof window !== 'undefined' && chrome.extension.getViews?.({ type: 'popup' })[0] === window;

export const isObject = (value: unknown): value is object => value instanceof Object;

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined';

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNull = (value: unknown): value is null => value === null;

export const round = (value: number, precision = 0) =>
  Number(Math.round(Number(value + 'e' + precision)) + 'e-' + precision);

export const objectPick = (obj: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));

export const formatNumber = (number: number) => (!isNaN(number) ? number.toLocaleString('en-US') : null);

export const parseNumber = (n: string | number) => (isNumeric(n) ? parseFloat(n as string) : null);

export const isNumeric = (n: string | number) => !isNaN(parseFloat(n as string)) && isFinite(n as number);

export const isValidUrl = (url: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch (e) {
    return false;
  }
};

export const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const createHugeString = (length = 1000000) => {
  let string = '';
  for (let i = 0; i < length; i++) {
    string += '1';
  }
  return string;
};

export const getErrorMessage = (error: unknown, defaultMessage?: string | undefined) => {
  if (!error) {
    return defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  // @ts-expect-error error is not an Error
  return error.reason || defaultMessage;
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
