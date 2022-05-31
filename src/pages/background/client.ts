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
      if (state.pk.current?.address !== storeCache?.pk.current?.address) {
        this._postMessage({
          action: 'address',
          payload: state.pk.current?.address,
        });
      }
      if (state.pk.current?.balance !== storeCache?.pk.current?.balance) {
        this._postMessage({
          action: 'balance',
          payload: state.pk.current?.balance,
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
    switch (action) {
      // if client was previously authorized, then we can just send the message
      case 'connect': {
        return { action };
      }
      case 'get-address': {
        return {
          action: 'address',
          payload: store.getState().pk.current?.address,
        };
      }
      case 'get-balance': {
        const state = store.getState();
        const address = state.pk.current?.address;

        if (address) {
          const balance = await woc.getBalance(address);
          store.dispatch(setBalance({ address, balance }));
          return {
            action: 'balance',
            payload: balance,
          };
        } else {
          return {
            action: 'error',
            payload: {
              reason: 'Address not selected',
            },
          };
        }
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
  }

  private async _processClientData() {
    const storageKey = `origin: ${this._origin}`;
    const storageData = await chrome.storage.local.get(storageKey);
    const data = storageData[storageKey];

    if (data) {
      this._isAuthorized = !!data.isAuthorized;
    } else {
      await chrome.storage.local.set({
        [storageKey]: {
          origin: this._origin,
          isAuthorized: this._isAuthorized,
        },
      });
    }
  }

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

  public destroy() {
    // TODO: unsubscribe and prepare for garbage collection
    console.log(`client ${this._origin} destroyed`);
    this._unsubscribeRedux();
    chrome.storage.onChanged.removeListener(this._onStorageChanged);
  }
}
