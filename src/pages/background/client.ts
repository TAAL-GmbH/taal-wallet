import { db } from '@/src/db';
import { getBalance, getUnspent } from '@/src/features/wocApi';
import { store } from '@/src/store';
import { derivePk, mergeSplit, restorePK } from '@/src/utils/blockchain';
import { createDialog } from '@/src/utils/createDialog';
import 'bsv/message';
import bsv from 'bsv';
import { waitForTruthy } from '@/src/utils/waitForTruthy';
import { isNull } from '@/src/utils/generic';
const BN = require('bn.js');

type Options = {
  port: chrome.runtime.Port;
};

type Msg = {
  action: string;
  payload: unknown;
  requestId: number;
  timeout?: number;
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
          payload: state.pk.activePk?.balance.satoshis,
        });
      }

      if (state.pk.network?.envName && state.pk.network.envName !== storeCache?.pk.network?.envName) {
        this._postMessage({
          action: 'network',
          payload: state.pk.network.envName,
        });
      }

      // on account change
      if (
        state.account.activeAccountId &&
        storeCache?.account.activeAccountId &&
        state.account.activeAccountId !== storeCache?.account.activeAccountId
      ) {
        console.log({
          state: state.account.activeAccountId,
          cache: storeCache?.account.activeAccountId,
        });
        this._postMessage<{ reason: string }>({
          action: 'disconnect',
          payload: {
            reason: 'Account changed',
          },
        });
      }

      // on unlock
      if (
        state.pk.rootPk?.privateKeyHash &&
        state.pk.rootPk?.privateKeyHash !== storeCache?.pk.rootPk?.privateKeyHash
      ) {
        const { publicKeyHash } = this._getKey();
        this._postMessage<string>({
          action: 'rootPublicKey',
          payload: this._getRootKey().publicKey.toString(),
        });
        this._postMessage({
          action: 'rootPublicKey',
          payload: publicKeyHash.toString(),
        });
      }

      if (state.pk.isLocked === true) {
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

  private _getRootKey() {
    const { privateKeyHash: rootPrivateKeyHash } = store.getState().pk.rootPk;
    return restorePK(rootPrivateKeyHash);
  }

  private _postMessage<T>(
    msg: {
      action: string;
      payload?: T;
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
    // wait until state is restored and isLocked state is known
    if (isNull(store.getState().pk.isLocked)) {
      const waitForLockedStateResult = await waitForTruthy(() => store.getState().pk.isLocked !== null, {
        timeout: 5000,
      });
      if (!waitForLockedStateResult) {
        throw new Error('Wallet is not responding. Please try again later');
      }
    }

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

    const { action, payload, requestId, timeout } = msg;

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
      const result = await this._handleExternalAction({ action, payload, timeout });
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

  private async _handleExternalAction({
    action,
    payload,
    timeout,
  }: Pick<Msg, 'action' | 'payload' | 'timeout'>) {
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
        case 'getNetwork': {
          return {
            action: 'network',
            payload: store.getState().pk.network.envName,
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
          // const { data } = await getUnspent(address);
          const { data } = await getUnspent(address, { forceRefetch: true });
          return {
            action: 'unspent',
            payload: data,
          };
        }
        case 'mergeSplit': {
          const { satoshis, minChange } = payload as { satoshis: number; minChange: number };
          const pk = store.getState().pk;
          const { privateKeyHash } = this._getKey();

          const result = await mergeSplit({
            satoshis,
            minChange,
            network: pk.network.envName,
            myAddress: pk.activePk.address,
            privateKeyHash,
          });

          return {
            action: 'mergeSplit',
            payload: result,
          };
        }
        case 'signTx': {
          const result = await createDialog({
            title: 'Do you want to sign this transaction?',
            body: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
            options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
            timeout,
          });

          if (result.selectedOption !== 'yes') {
            throw new Error('User rejected transaction signing');
          }

          const { privateKeyHash } = this._getKey();

          const tx = new bsv.Transaction(payload);
          const signedTx = tx.sign(privateKeyHash);

          return {
            action: 'signTx',
            payload: signedTx.serialize(true),
          };
        }

        case 'signPreimage': {
          const result = await createDialog({
            title: 'Do you want to sign this pre-image?',
            body: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
            options: [{ label: 'Yes', variant: 'primary', returnValue: 'yes' }, { label: 'No' }],
            timeout,
          });

          if (result.selectedOption !== 'yes') {
            throw new Error('User rejected pre-image signing');
          }

          const { tx, script, i, satoshis } = payload as {
            tx: string;
            sighash: number;
            script: string;
            i: number;
            satoshis: number;
          };

          const sighash2 = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;
          const t = new bsv.Transaction(tx);
          const { privateKeyHash } = this._getKey();
          const pk = new bsv.PrivateKey(privateKeyHash);

          const satsBN = BN.fromNumber(satoshis);
          // @ts-expect-error TransactionSignature not defined
          let signature: bsv.TransactionSignature;
          try {
            // @ts-expect-error sighash method is not typed in .d.ts
            signature = bsv.Transaction.sighash.sign(t, pk, sighash2, i, script, satsBN);
          } catch (e) {
            console.error('error signing preimage', e);
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
            timeout,
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
      console.error("Can't get private key hash", { rootPk, path });
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
