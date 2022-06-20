import { routes } from '../constants/routes';

export const navigateTo = (path: keyof typeof routes) => {
  window.location.hash = `#${path}`;
};

export const getRoute = () => {
  const { hash } = window.location;
  return hash === '' ? '/' : hash.substring(1);
};
