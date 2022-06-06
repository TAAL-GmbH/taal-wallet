import { Client } from './client';
import { store } from '@/src/store';
// import { pk } from '@/src/libs/PK';
import { onPushMessage } from './pushMessageHandler';
import { initStoreSync } from '@/src/utils/storeSync';
import { TAAL_ICON_URL } from '@/src/constants';

// @ ts-expect-error
// importScripts('/scripts/bitcoin-components.js');
// @ ts-expect-error
// importScripts('/scripts/wallet-connect.js');
// @ ts-expect-error
// importScripts('/scripts/bsv-min.js');
// @ ts-expect-error
// importScripts('/scripts/bsv-message.min.js');

// pk.init('background');
// @ ts-expect-error ignore this
// globalThis['pk'] = pk;
// @ts-expect-error ignore this
globalThis['store'] = store;

initStoreSync();

// const sighash =
//   bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;

self.addEventListener('push', onPushMessage);

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) =>
  console.log('onInstalled', { previousVersion, reason })
);
chrome.runtime.onUpdateAvailable.addListener((...args) =>
  console.log('onUpdateAvailable', args)
);

chrome.runtime.onConnectExternal.addListener(port => {
  let client: Client | null = new Client({ port });

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
    client && port.onMessage.removeListener(client.onMessage);
    client?.destroy();
    client = null;
    console.log('client destroyed', globalThis.performance);
  };

  port.onDisconnect.addListener(onPortDisconnect);
  port.onMessage.addListener(client.onMessage);

  // TODO: make sure this function is destroyed when the port is closed
});
