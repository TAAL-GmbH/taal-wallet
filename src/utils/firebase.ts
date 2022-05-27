import { firebaseConfig } from '../firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const vapidKey =
  'BNlC3u-XP-IRqBgYSeCEmqbU6p9nhrN0VA0126H15YvIUNQvOmqukVfildkTn0mt-Ar-ph5ae2hp5RWpmTUfi74';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const getWebPushToken = async () => {
  const serviceWorkerRegistration =
    await navigator.serviceWorker.getRegistration();

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });
};
