import { db } from '@/src/db';
import { getBalance } from '@/src/features/wocApiSlice';
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
  private _unsubscribeRedux: () => void;

  constructor({ port }: Options) {
    if (!port.sender?.origin) {
      throw new Error("Can't get origin");
    }
    this._port = port;
    this._origin = port.sender?.origin;
    this.onExternalMessage = this.onExternalMessage.bind(this);
    this.onInternalMessage = this.onInternalMessage.bind(this);
    this._unsubscribeRedux = this._watchReduxState();
  }

  private _watchReduxState() {
    let storeCache: ReturnType<typeof store.getState>;
    return store.subscribe(async () => {
      if (!this._isAuthorized) {
        return;
      }

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

  private _postMessage(
    msg: {
      action: string;
      payload?: unknown;
      requestId?: number;
    },
    sendUnauthorized = false
  ) {
    if (this._isAuthorized || sendUnauthorized) {
      this._port.postMessage(msg);
    } else {
      console.error('Can not post message to client, not authorized', msg);
    }
  }

  private _ping() {
    this._postMessage(
      {
        action: 'ping',
      },
      true
    );
    this._disconectTimer = setTimeout(() => {
      this._isConnected = false;
      this._postMessage(
        {
          action: 'disconnect',
        },
        true
      );
      this.destroy();
    }, 1000);
  }

  private _onConnect() {
    this._isConnected = true;
    this._clearTimers();
    this._pingTimer = setInterval(this._ping.bind(this), 1000);
  }

  private async _checkPermissions() {
    if (store.getState().pk.isLocked) {
      // TODO: show dialog to unlock
      // throw new Error('Wallet is locked. Please unlock it first');
    }

    if (this._isAuthorized) {
      return true;
    }

    const originData = await db.getOrigin(this._origin);

    if (originData?.isAuthorized) {
      this._isAuthorized = true;
      return true;
    } else if (originData?.isPersistent) {
      throw new Error('Origin is not authorized');
    }

    const isPermissionGranted = await this._requestAccessPermission();

    await db.setOrigin({
      origin: this._origin,
      isAuthorized: isPermissionGranted,
      isPersistent: isPermissionGranted,
    });

    if (isPermissionGranted) {
      this._isAuthorized = true;
      return true;
    }

    throw new Error('Permission denied');
  }

  public async onExternalMessage(msg: Msg) {
    // ignore invalid messages
    if (!(msg instanceof Object)) {
      return;
    }

    const { action, payload, requestId } = msg;

    // reject requests without action
    if (!action) {
      throw new Error('No action provided');
    }

    // action !== 'pong' && console.log('onExternalMessage', action, payload);

    try {
      await this._checkPermissions();
    } catch (e) {
      this._postMessage(
        {
          action: 'error',
          payload: {
            reason: (e as Error)?.message,
          },
          requestId,
        },
        true
      );
      this.destroy();
      return;
    }

    // handle pong response
    if (action === 'pong') {
      clearTimeout(this._disconectTimer);
      return;
    }

    try {
      const result = await this._handleExternalAction({ action, payload });
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

  public onInternalMessage(
    { action, payload }: { action: string; payload: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (result: unknown) => void
  ) {
    (async () => {
      const result = await this._handleInternalAction({
        action,
        payload,
        sender,
      });
      sendResponse(result);
    })();
    return true;
  }

  private async _requestAccessPermission() {
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
    });

    return result.selectedOption === 'yes';
  }

  private async _handleExternalAction({
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
        case 'getAddress': {
          return {
            action: 'address',
            payload: store.getState().pk.activePk?.address,
          };
        }
        case 'getBalance': {
          const { total } = await getBalance([address]);
          return {
            action: 'balance',
            payload: total,
          };
        }
        case 'signPreimage': {
          // TODO: implement signPreimage
          console.log('signPreimage', payload);
          return {
            action: 'error',
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

  private async _handleInternalAction({
    action,
    payload,
    sender,
  }: {
    action: string;
    payload: unknown;
    sender: chrome.runtime.MessageSender;
  }) {
    switch (action) {
      default: {
        return {
          action: 'error',
          reason: 'not-implemented',
        };
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
  }
}
