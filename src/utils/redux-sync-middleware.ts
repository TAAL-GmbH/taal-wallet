import { Middleware, AnyAction, MiddlewareAPI, Dispatch } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { RootState } from '@/store';

import { waitForTruthy } from './wait-for-truthy';

const bc = new BroadcastChannel('redux_sync_channel');

bc.addEventListener('messageerror', err => {
  console.error('BroadcastChannel message error', err);
});

const BACKGROUND_PAGE_PATH = 'background.js';

const extensionId = chrome.runtime.id;

const pagePath = typeof window === 'undefined' ? BACKGROUND_PAGE_PATH : window?.location.pathname;
const isBackgroundPage = pagePath === BACKGROUND_PAGE_PATH;

const isValidOrigin = (origin: string) => {
  return origin === `chrome-extension://${extensionId}`;
};

const shouldForward = (action: AnyAction) => {
  return /^(pk|account|client)\/.+/.test(action.type) && (!action.meta || !action.meta.local);
};

const initBroadcastChannel = (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => {
  bc.onmessage = ({ data, origin }) => {
    if (!isValidOrigin(origin)) {
      throw new Error(`Invalid sender origin: ${origin}`);
    }
    if (data.pagePath === pagePath) {
      return; // ignore from self
    }

    if (data.action.startsWith('bg:') && isBackgroundPage) {
      if (data.action === 'bg:dispatch') {
        store.dispatch(data.reduxAction);
      } else if (data.action === 'bg:getState') {
        waitForTruthy(() => store.getState().pk.isStateInitialized, { timeout: 5000 })
          .then(() => {
            bc.postMessage({
              action: 'fe:dispatch',
              reduxAction: {
                type: 'pk/setState',
                payload: store.getState().pk,
              },
            });

            bc.postMessage({
              action: 'fe:dispatch',
              reduxAction: {
                type: 'account/setState',
                payload: store.getState().account,
              },
            });

            bc.postMessage({
              action: 'fe:dispatch',
              reduxAction: {
                type: 'client/setState',
                payload: store.getState().client,
              },
            });

            bc.postMessage({
              action: 'fe:dispatch',
              reduxAction: {
                type: 'account/setState',
                payload: { isInSync: true },
              },
            });
          })
          .catch(() => {
            toast.error('Failed to initialize state');
          });
      }
    } else if (data.action === 'fe:dispatch' && !isBackgroundPage) {
      store.dispatch(data.reduxAction);
    }
  };
};

export const reduxSyncMiddleWare: Middleware = store => {
  initBroadcastChannel(store);

  /**
   * Background serviceWorker is source of truth.
   * Every Chrome extension window will ask "bg:getState" on init
   */
  if (!isBackgroundPage) {
    waitForTruthy(
      async () => {
        const result: boolean = await chrome.runtime.sendMessage({
          action: 'bg:getStateInitializationStatus',
        });
        return result;
      },
      { timeout: 5000 }
    ).then(isInitialized => {
      if (isInitialized) {
        bc.postMessage({
          action: 'bg:getState',
        });
      } else {
        toast.error('Failed to initialize state');
      }
    });
  }

  return next => (reduxAction: AnyAction) => {
    if (isBackgroundPage && shouldForward(reduxAction)) {
      bc.postMessage({
        action: 'fe:dispatch',
        reduxAction: {
          ...reduxAction,
          meta: {
            ...reduxAction.meta,
            baseQueryMeta: {},
            local: true,
          },
        },
        pagePath,
      });
    }

    if (!isBackgroundPage && shouldForward(reduxAction)) {
      bc.postMessage({
        action: 'bg:dispatch',
        reduxAction,
      });
      return;
    }

    next(reduxAction);
  };
};
