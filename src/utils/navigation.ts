import { routes } from '@/constants/routes';

type Keys = keyof typeof routes;
type Values = typeof routes[Keys];

// export const navigateTo = (path: keyof typeof routes) => {
export const navigateTo = (path: Values) => {
  window.location.hash = `#${path}`;
};

export const getLocationPath = () => {
  const { hash } = window.location;
  return hash === '' ? '/' : hash.substring(1);
};
