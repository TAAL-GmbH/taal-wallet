// import { hotjar } from 'react-hotjar';
import { TrackEventOptions } from '@/src/types';

export const initializeTracking = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
};

export const trackPageView = (path: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  // hotjar.stateChange(path);
};

export const trackEvent = ({
  category,
  action,
  label,
}: TrackEventOptions): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const eventString = [category, label, action].filter(Boolean).join('/');
  // hotjar.event(eventString);
};

export const identifyUser = (userId: string, details?: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }
  // hotjar.identify(userId, { userProperty: details });
};
