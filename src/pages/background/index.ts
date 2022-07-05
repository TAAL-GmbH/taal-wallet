import { store } from '@/src/store';
import { Client } from './client';
import { onPushMessage } from './pushMessageHandler';
import { initStoreSync, restoreDataFromDb } from '@/src/utils/storeSync';
import { alarms, TAAL_ICON_URL } from '@/src/constants';
import { db } from '@/src/db';
import { lockWallet, setState } from '@/src/features/pkSlice';

class ClientList {
  private _clientList: Client[] = [];

  private _updateBadge() {
    const text = this._clientList.length ? `${this._clientList.length}` : '';
    chrome.action.setBadgeText({ text });
  }

  public add(client: Client) {
    this._clientList.push(client);
    this._updateBadge();
  }

  public remove(client: Client) {
    this._clientList = this._clientList.filter(c => c !== client);
    this._updateBadge();
  }
}
const clientList = new ClientList();

// @ ts-expect-error ignore this
globalThis['clientList'] = clientList;

// @ ts-expect-error ignore this
globalThis['store'] = store;

initStoreSync();

chrome.action.setBadgeBackgroundColor({ color: 'darkorange' });
chrome.action.setBadgeText({ text: '' });

self.addEventListener('push', onPushMessage);

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
  // console.log('onInstalled', { previousVersion, reason })
});
chrome.runtime.onUpdateAvailable.addListener((...args) => console.log('onUpdateAvailable', args));

chrome.alarms.onAlarm.addListener(({ name }) => {
  switch (name) {
    case alarms.WALLET_LOCK: {
      store.dispatch(lockWallet());
      break;
    }
  }
});

// internal one-time connection handling
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log('onDisconnect');
    chrome.alarms.create(alarms.WALLET_LOCK, { delayInMinutes: 5 });
  });

  // add alarm on connect
  chrome.alarms.clear(alarms.WALLET_LOCK);
});

// internal long-lived connection handling
chrome.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
  (async () => {
    switch (action) {
      case 'bg:setAccount': {
        await db.useAccount(payload);
        // let's clean up the state as we have switched to new account
        store.dispatch(
          setState({
            map: {},
            rootPk: null,
            activePk: null,
            network: null,
          })
        );
        sendResponse('account set');
        break;
      }

      case 'bg:reloadFromDb': {
        await restoreDataFromDb();
        sendResponse('restored data from db');
        break;
      }
    }
  })();

  return true;
});

// external webpage connection handling
chrome.runtime.onConnectExternal.addListener(port => {
  let client: Client | null = new Client({ port });

  chrome.runtime.onMessage.addListener(client.onInternalMessage);

  chrome.notifications.onClicked.addListener(() => chrome.runtime.openOptionsPage(console.log));

  const onPortDisconnect = async () => {
    console.log('port disconnected');
    port.onDisconnect.removeListener(onPortDisconnect);
    clientList.remove(client);
    client && port.onMessage.removeListener(client.onExternalMessage);
    client && chrome.runtime.onMessage.removeListener(client.onInternalMessage);
    await client?.destroy();
    client = null;
    console.log('client destroyed', globalThis.performance);
  };

  port.onDisconnect.addListener(onPortDisconnect);
  port.onMessage.addListener(client.onExternalMessage);

  client.onAuthorized = () => {
    clientList.add(client);

    chrome.notifications.create({
      type: 'basic',
      iconUrl: TAAL_ICON_URL,
      title: 'TAAL Web3 Wallet',
      message: `Webpage with origin ${port.sender?.origin} connected to TAAL's Web3 Wallet`,
    });
  };

  // TODO: make sure this function is destroyed when the port is closed
});
