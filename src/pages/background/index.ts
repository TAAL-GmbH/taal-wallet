import bsv from 'bsv';

import { store } from '@/store';
import { initStoreSync, restoreDataFromDb } from '@/utils/store-sync';
import { alarms, TAAL_ICON_URL } from '@/constants';
import { db } from '@/db';
import { clearState, lockWallet } from '@/features/pk-slice';
import { sharedDb } from '@/db/shared';
import { AccountFactory } from '@/utils/account-factory';
import { dispatchAndValidate } from '@/utils/dispatch-and-validate';

import { Client } from './client';
import { onPushMessage } from './push-message-handler';
import { clientList } from './client-list-controller';

// adjust DUST_AMOUNT to 0 in background script entry point
// @ts-expect-error DUST_AMOUNT is not typed
bsv.Transaction.DUST_AMOUNT = 0;

// @ ts-expect-error ignore this
globalThis['clientList'] = clientList;

// @ ts-expect-error ignore this
globalThis['store'] = store;

// @ ts-expect-error ignore this
globalThis['AccountFactory'] = AccountFactory;

// @ ts-expect-error ignore this
globalThis['db'] = db;

// @ ts-expect-error ignore this
globalThis['sharedDb'] = sharedDb;

initStoreSync();

chrome.action.setBadgeBackgroundColor({ color: 'darkorange' });
chrome.action.setBadgeText({ text: '' });

self.addEventListener('push', onPushMessage);

chrome.alarms.onAlarm.addListener(({ name }) => {
  switch (name) {
    case alarms.WALLET_LOCK: {
      store.dispatch(lockWallet());
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setIcon({
        path: '/taal-round-locked4-128x128.png',
      });
      break;
    }
  }
});

const createWalletLockAlarm = async () => {
  const walletLockPeriod = (await sharedDb.getKeyVal('walletLockPeriod')) || 30;
  chrome.alarms.create(alarms.WALLET_LOCK, { delayInMinutes: walletLockPeriod });
};

// internal long-lived connection handling
chrome.runtime.onConnect.addListener(async internalPort => {
  // add alarm on popup window close
  internalPort.onDisconnect.addListener(async () => {
    createWalletLockAlarm();
  });

  // clear alarm on popup window open
  chrome.alarms.clear(alarms.WALLET_LOCK);
});

// internal one-time connection handling
chrome.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
  (async () => {
    switch (action) {
      case 'bg:ping': {
        sendResponse('pong');
        break;
      }
      case 'bg:createAccount': {
        const af = new AccountFactory();
        sendResponse(await af.createAccount(payload));
        break;
      }
      case 'bg:setAccount': {
        if (store.getState().account.activeAccountId !== payload) {
          await db.useAccount(payload);

          // let's clean up the state as we have switched to new account
          await dispatchAndValidate(clearState(), s => Object.keys(s.pk.map).length === 0);

          await restoreDataFromDb();
        }
        sendResponse(`BG: account-set to ${db.getName()}`);
        break;
      }

      case 'bg:getStateInitializationStatus': {
        sendResponse(store.getState().pk.isStateInitialized);
        break;
      }
    }
  })();

  return true;
});

export const initBackground = () => {
  // log.debug('initBackground');
  // external webpage connection handling
  chrome.runtime.onConnectExternal.addListener(port => {
    let client: Client | null = new Client({ port });

    chrome.notifications.onClicked.addListener(() => chrome.runtime.openOptionsPage(console.log));

    const onPortDisconnect = async () => {
      port.onDisconnect.removeListener(onPortDisconnect);
      clientList.remove(client);
      client && port.onMessage.removeListener(client.onExternalMessage);
      await client?.destroy();
      client = null;
      // console.log('client destroyed', globalThis.performance);
    };

    port.onDisconnect.addListener(onPortDisconnect);
    port.onMessage.addListener(client.onExternalMessage);

    client.onAuthorized = () => {
      clientList.add(client);

      chrome.notifications.create({
        type: 'basic',
        iconUrl: TAAL_ICON_URL,
        title: 'TAAL Wallet',
        message: `Webpage with origin ${port.sender?.origin} connected to TAAL Wallet`,
      });
    };

    // TODO: make sure this function is destroyed when the port is closed
  });
};

// don't init in test env
if (process.env.NODE_ENV !== 'test') {
  initBackground();
}
