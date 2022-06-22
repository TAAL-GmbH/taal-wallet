import { store } from '@/src/store';
import { Client } from './client';
import { onPushMessage } from './pushMessageHandler';
import { initStoreSync } from '@/src/utils/storeSync';
import { TAAL_ICON_URL } from '@/src/constants';

// @ ts-expect-error ignore this
globalThis['store'] = store;

initStoreSync();

self.addEventListener('push', onPushMessage);

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
  // console.log('onInstalled', { previousVersion, reason })
});
chrome.runtime.onUpdateAvailable.addListener((...args) =>
  console.log('onUpdateAvailable', args)
);

chrome.runtime.onConnectExternal.addListener(port => {
  let client: Client | null = new Client({ port });

  chrome.runtime.onMessage.addListener(client.onInternalMessage);

  chrome.notifications.onClicked.addListener(() =>
    chrome.runtime.openOptionsPage(console.log)
  );

  chrome.notifications.create({
    type: 'basic',
    iconUrl: TAAL_ICON_URL,
    title: 'TAAL Web3 Wallet',
    message: `Webpage with origin ${port.sender?.origin} connected to TAAL's Web3 Wallet`,
  });

  const onPortDisconnect = () => {
    console.log('port disconnected');
    port.onDisconnect.removeListener(onPortDisconnect);
    client && port.onMessage.removeListener(client.onExternalMessage);
    client && chrome.runtime.onMessage.removeListener(client.onInternalMessage);
    client?.destroy();
    client = null;
    console.log('client destroyed', globalThis.performance);
  };

  port.onDisconnect.addListener(onPortDisconnect);
  port.onMessage.addListener(client.onExternalMessage);

  // TODO: make sure this function is destroyed when the port is closed
});
