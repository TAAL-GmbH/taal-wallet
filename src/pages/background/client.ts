import { setBalance } from '@/src/features/pkSlice';
import { woc } from '@/src/libs/WOC';
import { store } from '@/src/store';
import { createDialog } from '@/src/utils/createDialog';

type Options = {
  port: chrome.runtime.Port;
};

type Msg = {
  action: string;
  payload: unknown;
  requestId: number;
};

export class Client {
  private _port: chrome.runtime.Port;
  private _origin: string;
  private _isAuthorized = false;
  private _isConnected = false;
  private _pingTimer: ReturnType<typeof setTimeout> | null = null;
  private _disconectTimer: ReturnType<typeof setTimeout> | null = null;
  private _storageDataLoaded = false;
  private _unsubscribeRedux: () => void;

  constructor({ port }: Options) {
    if (!port.sender?.origin) {
      throw new Error("Can't get origin");
    }
    this._port = port;
    this._origin = port.sender?.origin;
    this._onStorageChanged = this._onStorageChanged.bind(this);
    this.onMessage = this.onMessage.bind(this);

    chrome.storage.onChanged.addListener(this._onStorageChanged);
    this._unsubscribeRedux = this._watchReduxState();
  }

  private _watchReduxState() {
    let storeCache: ReturnType<typeof store.getState>;
    return store.subscribe(async () => {
      const state = store.getState();
      if (state.pk.activePk?.address !== storeCache?.pk.activePk?.address) {
        this._postMessage({
          action: 'address',
          payload: state.pk.activePk?.address,
        });
      }
      if (state.pk.activePk?.balance !== storeCache?.pk.activePk?.balance) {
        this._postMessage({
          action: 'balance',
          payload: state.pk.activePk?.balance.amount,
        });
      }
      storeCache = state;
    });
  }

  private _postMessage(msg: {
    action: string;
    payload?: unknown;
    requestId?: number;
  }) {
    if (this._isAuthorized) {
      this._port.postMessage(msg);
    } else {
      console.warn('Can not post message to client, not authorized');
    }
  }

  private _ping() {
    this._postMessage({
      action: 'ping',
    });
    this._disconectTimer = setTimeout(() => {
      this._isConnected = false;
      this._postMessage({
        action: 'disconnect',
      });
      this.destroy();
    }, 1000);
  }

  private _onConnect() {
    this._isConnected = true;
    this._clearTimers();
    this._pingTimer = setInterval(this._ping.bind(this), 1000);
  }

  public async onMessage(msg: Msg) {
    // ignore invalid messages
    if (!(msg instanceof Object)) {
      return;
    }

    const { action, payload, requestId } = msg;

    // reject requests without action
    if (!action) {
      throw new Error('No action provided');
    }

    // initial run
    // this can not be done in constructor because we need to await
    if (!this._storageDataLoaded) {
      await this._processClientData();
      this._storageDataLoaded = true;
    }

    if (!this._isAuthorized) {
      this._handleNewClient();
      return;
    }

    // handle pong response
    if (action === 'pong') {
      clearTimeout(this._disconectTimer);
      return;
    }

    try {
      const result = await this._handleAction({ action, payload });
      this._postMessage({
        ...result,
        requestId,
      });
    } catch (e) {
      this._postMessage({
        action: 'error',
        payload: {
          reason: (e as Error)?.message,
        },
        requestId,
      });
    }
  }

  private async _handleNewClient() {
    const result = await createDialog({
      title: 'Permission request',
      body: `Do you want to allow 
        <div><code><strong>${this._origin}</strong></code></div> 
        to access TAAL Wallet?
        <h4>This will allow the client to:</h4>
        <ul>
          <li>Read you Wallet address</li>
          <li>Read you Wallet balance</li>
        </ul>
      `,
      options: [
        { label: 'Yes', variant: 'primary', returnValue: 'yes' },
        { label: 'No' },
      ],
      data: {
        origin: this._origin,
      },
    });

    if (result === 'yes') {
      const key = `origin: ${this._origin}`;
      const originData = (await chrome.storage.local.get(key))[key];
      chrome.storage.local.set({
        [key]: {
          ...originData,
          isAuthorized: true,
        },
      });
    }
  }

  private async _handleAction({
    action,
    payload,
  }: Pick<Msg, 'action' | 'payload'>) {
    const state = store.getState();
    const address = state.pk.activePk?.address;

    if (!address) {
      console.log('No address', store.getState());
      return {
        action: 'error',
        payload: {
          reason: 'Address not selected',
        },
      };
    }

    try {
      switch (action) {
        // if client was previously authorized, then we can just send the message
        case 'connect': {
          this._onConnect();
          return { action };
        }
        case 'get-address': {
          return {
            action: 'address',
            payload: store.getState().pk.activePk?.address,
          };
        }
        case 'get-balance': {
          const balance = await woc.getBalance(address);
          return {
            action: 'balance',
            payload: JSON.stringify(balance),
          };
        }
        case 'signPreimage': {
          // TODO: implement signPreimage
          return {
            action: 'balance',
            payload: 'not-implemented',
          };
        }
        default: {
          return {
            action: 'error',
            payload: {
              reason: `unknown action: ${action}`,
            },
          };
        }
      }
    } catch (e) {
      return {
        action: 'error',
        payload: {
          reason: e.message,
        },
      };
    }
  }

  // TODO: migrate to indexedDB
  private async _processClientData() {
    const storageKey = `origin: ${this._origin}`;
    const storageData = await chrome.storage.local.get(storageKey);
    const data = storageData[storageKey];

    if (data) {
      this._isAuthorized = !!data.isAuthorized;
      this._isConnected = true;
    } else {
      await chrome.storage.local.set({
        [storageKey]: {
          origin: this._origin,
          isAuthorized: this._isAuthorized,
        },
      });
    }
  }

  // TODO: migrate to broadcast API
  private async _onStorageChanged(
    changes: { [key: string]: chrome.storage.StorageChange },
    namespace: string
  ) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === `origin: ${this._origin}`) {
        if (oldValue?.isAuthorized !== newValue?.isAuthorized) {
          this._isAuthorized = newValue?.isAuthorized;
          this._postMessage({
            action: newValue?.isAuthorized ? 'connect' : 'disconnect',
          });
        }
      }
    }
  }

  private _clearTimers() {
    clearInterval(this._pingTimer);
    clearTimeout(this._disconectTimer);
  }

  public destroy() {
    // TODO: unsubscribe and prepare for garbage collection
    console.log(`client ${this._origin} destroyed`);
    this._unsubscribeRedux();

    this._clearTimers();

    // TODO: remove this after migration to broadcast API
    chrome.storage.onChanged.removeListener(this._onStorageChanged);
  }
}
