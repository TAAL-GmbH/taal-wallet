import { db } from '@/src/db';
import { getBalance, getUnspent } from '@/src/features/wocApi';
import { store } from '@/src/store';
import { derivePk, restorePK } from '@/src/utils/blockchain';
import { createDialog } from '@/src/utils/createDialog';
import 'bsv/message';
import bsv from 'bsv';
const BN = require('bn.js');

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
  public onAuthorized: (() => void) | null = null;

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

      if (
        state.pk.rootPk?.privateKeyHash &&
        state.pk.rootPk?.privateKeyHash !== storeCache?.pk.rootPk?.privateKeyHash
      ) {
        const { publicKeyHash } = this._getKey();
        return {
          action: 'publicKey',
          payload: publicKeyHash.toString(),
        };
      }

      if (state.pk.isLocked) {
        console.log('Wallet is locked');
        this._postMessage(
          {
            action: 'disconnect',
            payload: {
              reason: 'wallet-locked',
            },
          },
          true
        );
        this.destroy();
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
      throw new Error('Wallet is locked. Please unlock it first');
    }

    if (this._isAuthorized) {
      return true;
    }

    const originData = await db.getOrigin(this._origin);

    if (originData?.isAuthorized) {
      this._isAuthorized = true;
      this.onAuthorized && this.onAuthorized();
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
      this.onAuthorized && this.onAuthorized();
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
      await this.destroy();
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
        <div><strong>${this._origin}</strong></div> 
        to access TAAL Wallet?
        <h4>This will allow the client to:</h4>
        <ul>
          <li>Read you wallet address</li>
          <li>Read you wallet balance</li>
          <li>Read you public key</li>
        </ul>
      `,
      resizeWindow: true,
      options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
    });

    return result.selectedOption === 'yes';
  }

  private async _handleExternalAction({ action, payload }: Pick<Msg, 'action' | 'payload'>) {
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
        case 'getPublicKey': {
          const { publicKeyHash } = this._getKey();

          return {
            action: 'publicKey',
            payload: publicKeyHash.toString(),
          };
        }
        case 'getRootPublicKey': {
          const { privateKeyHash: rootPrivateKeyHash } = store.getState().pk.rootPk;
          const { publicKey: rootPublicKey } = restorePK(rootPrivateKeyHash);

          return {
            action: 'rootPublicKey',
            payload: rootPublicKey.toString(),
          };
        }
        case 'getBalance': {
          const { total } = await getBalance([address]);
          return {
            action: 'balance',
            payload: total,
          };
        }
        case 'getUnspent': {
          const { data } = await getUnspent(address);
          return {
            action: 'unspent',
            payload: data,
          };
        }
        case 'signTx': {
          const result = await createDialog({
            title: 'Do you want to sign this transaction?',
            body: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
            options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
          });

          if (result.selectedOption !== 'yes') {
            throw new Error('User rejected transaction signing');
          }

          const { privateKeyHash } = this._getKey();

          const tx = new bsv.Transaction(payload);
          const signedTx = tx.sign(privateKeyHash);

          return {
            action: 'signTx',
            // @ts-ignore
            payload: signedTx.serialize(true),
          };
        }

        case 'signPreimage': {
          const result = await createDialog({
            title: 'Do you want to sign this pre-image?',
            body: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
            options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
          });

          if (result.selectedOption !== 'yes') {
            throw new Error('User rejected pre-image signing');
          }

          const { tx, sighash, script, i, satoshis } = payload as {
            tx: string;
            sighash: number;
            script: string;
            i: number;
            satoshis: any;
          };

          // @ts-ignore
          const sighash2 = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;
          // @ts-ignore
          const t: bsv.Transaction = bsv.Transaction(tx);
          // @ts-ignore
          const { privateKeyHash } = this._getKey();
          const pk = new bsv.PrivateKey(privateKeyHash);
          // @ts-ignore
          const satsBN = BN.fromNumber(satoshis);
          // @ts-ignore
          let signature: bsv.TransactionSignature;
          try {
            // @ts-expect-error sighash method is not typed in .d.ts
            signature = bsv.Transaction.sighash.sign(t, pk, sighash2, i, script, satsBN);
          } catch (e) {
            console.log('error signing preimage');
            console.log(e);
            throw e;
          }

          return {
            action: 'signPreimage',
            payload: signature.toTxFormat().toString('hex'),
          };
        }

        case 'signMessage': {
          const result = await createDialog({
            title: 'Do you want to sign this message?',
            body: `<pre>${payload}</pre>`,
            options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
          });

          if (result.selectedOption !== 'yes') {
            throw new Error('User rejected transaction signing');
          }

          const { privateKeyHash } = this._getKey();
          const msg = new bsv.Message(payload as string);
          const pk = new bsv.PrivateKey(privateKeyHash);

          const signedMsg = msg.sign(pk);

          return {
            action: 'signMessage',
            payload: signedMsg.toString(),
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
      console.error('_handleExternalAction', { action, payload }, e);
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

  private _getKey() {
    const { rootPk, activePk } = store.getState().pk;
    const path = activePk?.path;

    if (!rootPk?.privateKeyHash || !path) {
      throw new Error("Can't get private key hash");
    }

    return derivePk({
      rootKey: rootPk.privateKeyHash,
      path,
    });
  }

  private _clearTimers() {
    clearInterval(this._pingTimer);
    clearTimeout(this._disconectTimer);
  }

  public async destroy() {
    // TODO: unsubscribe and prepare for garbage collection
    // console.log(`client ${this._origin} destroyed`);
    this._unsubscribeRedux();

    this._clearTimers();
  }
}
