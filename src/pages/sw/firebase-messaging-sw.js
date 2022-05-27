import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyD8LVSs0R8LRQfFG0fGx4zzCkI-rp4CFtI',
  authDomain: 'web3-wallet-test.firebaseapp.com',
  projectId: 'web3-wallet-test',
  storageBucket: 'web3-wallet-test.appspot.com',
  messagingSenderId: '1007734273033',
  appId: '1:1007734273033:web:4b872be15ced64ab3034d8',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// https://firebase.google.com/docs/cloud-messaging/concept-options
messaging.onBackgroundMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    // icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // chrome.storage.session.set({
  //   pushData: payload.data,
  // });
});
