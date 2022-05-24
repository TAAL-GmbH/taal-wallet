import { routes } from '../constants/routes';

export const navigateTo = (path: keyof typeof routes) => {
  window.location.hash = `#${path}`;
};
