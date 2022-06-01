// import { hotjar } from 'react-hotjar';
import { TrackEventOptions } from '@/src/types';

export const initializeTracking = (): void => {};

export const trackPageView = (path: string): void => {};

export const trackEvent = ({
  category,
  action,
  label,
}: TrackEventOptions): void => {
  // const eventString = [category, label, action].filter(Boolean).join('/');
};

export const identifyUser = (userId: string, details?: unknown): void => {};
