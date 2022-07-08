import { Middleware, AnyAction } from '@reduxjs/toolkit';

const BACKGROUND_PAGE_PATH = 'background.js';

const extensionId = chrome.runtime.id;
const pagePath = typeof window === 'undefined' ? BACKGROUND_PAGE_PATH : window?.location.pathname;
const isBackgroundPage = pagePath === BACKGROUND_PAGE_PATH;

const isValidOrigin = (origin: string) => {
  return origin === `chrome-extension://${extensionId}`;
};

const shouldForward = (action: AnyAction) => {
  return /^(pk|account)\/.+/.test(action.type) && (!action.meta || !action.meta.local);
};

export const reduxSyncMiddleWare: Middleware = store => {
  const bc = new BroadcastChannel('redux_sync_channel');

  bc.onmessage = ({ data, origin }) => {
    if (!isValidOrigin(origin)) {
      throw new Error('Invalid sender origin');
    }
    if (data.pagePath === pagePath) {
      return; // ignore from self
    }

    if (data.action === 'dispatch') {
      // console.log(`${pagePath}: ON DISPATCH:`, data);
      store.dispatch({
        ...data.reduxAction,
        meta: {
          ...data.reduxAction.meta,
          local: true,
        },
      });
    }

    /**
     * Background serviceWorker is source of thruth.
     * Every Chrome extension window will ask "getState" on init
     */
    if (data.action === 'getState' && isBackgroundPage) {
      // broadcast dispatch structured event to sync extension windows to background
      bc.postMessage({
        action: 'dispatch',
        reduxAction: {
          type: 'pk/setState',
          payload: store.getState().pk,
        },
        pagePath: BACKGROUND_PAGE_PATH,
      });

      bc.postMessage({
        action: 'dispatch',
        reduxAction: {
          type: 'account/setState',
          payload: store.getState().account,
        },
        pagePath: BACKGROUND_PAGE_PATH,
      });
    }
  };

  // non-background pages should ask background for the whole state
  if (!isBackgroundPage) {
    bc.postMessage({
      action: 'getState',
    });
  }

  return next => (reduxAction: AnyAction) => {
    if (shouldForward(reduxAction)) {
      // console.log('broadcast', reduxAction);
      bc.postMessage({
        action: 'dispatch',
        reduxAction: {
          ...reduxAction,
          meta: {
            ...reduxAction.meta,
            baseQueryMeta: {},
          },
        },
        pagePath,
      });
    }
    next(reduxAction);
  };
};
