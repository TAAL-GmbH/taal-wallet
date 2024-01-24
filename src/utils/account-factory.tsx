import { HDPrivateKey } from 'bsv';

import { networkList } from '@/constants/network-list';
import { db } from '@/db';
import { sharedDb } from '@/db/shared';
import {
  accountEvent,
  addAccount,
  setAccountCreationDerivationPathLastIndex,
  setActiveAccountId,
  setIsCreating,
  setIsHistoryFetching,
  setRestoredWalletsCount,
} from '@/features/account-slice';
import { appendPKList, clearState, setActivePk, setNetwork, setRootPK, setState } from '@/features/pk-slice';
import { getHistory } from '@/features/woc-api';
import { store } from '@/store';
import { PKType } from '@/types';
import { delay, getErrorMessage, isNull } from '@/utils/generic';
import { initStoreSync } from '@/utils/store-sync';
import { createHDPrivateKey, derivePk, rebuildMnemonic } from '@/utils/blockchain';
import { encrypt } from '@/utils/crypt';
import { dispatchAndValidate } from '@/utils/dispatch-and-validate';
import { waitForTruthy } from '@/utils/wait-for-truthy';

const EMPTY_WALLETS_SLOT_COUNT = 20;

type AccountData = {
  accountId: string;
  accountName: string;
  hasPassphrase: boolean;
  networkId: string;
  privateKeyHash: string;
  privateKeyEncrypted: string;
};

type CreateAccountOptions = {
  accountName: string;
  networkId: string;
  password: string;
  mnemonicPhrase: string;
  action: 'importExisting' | 'createNew';
  passphrase?: string;
};

export type CreateAccountReturnType =
  | {
      success: true;
      data: {
        accountId: string;
        accountName: string;
        networkId: string;
      };
    }
  | {
      success: false;
      error: {
        message: string;
      };
    };

const logEvent = (options: Parameters<typeof accountEvent>[0]) => store.dispatch(accountEvent(options));

export class AccountFactory {
  private noHistoryCount = 0;
  private walletList: PKType[] = [];
  private timeoutMultiplier = 1;

  // used for tests only
  public setTimeoutMultiplier(multiplier: number) {
    this.timeoutMultiplier = multiplier;
  }

  public createAccount = async (values: CreateAccountOptions): Promise<CreateAccountReturnType> => {
    const { networkId, password, mnemonicPhrase, action, passphrase } = values;
    const accountName = values.accountName.trim();

    store.dispatch(setIsCreating(true));
    logEvent({
      message: 'Creating account...',
      showToUser: true,
    });

    const previousAccountId = store.getState().account.activeAccountId;
    const accountId = `${Date.now()}`;

    // write activeAccountId to db if it's first account
    // otherwise it will be written in final stage
    if (!(await sharedDb.getAccountList()).length) {
      await sharedDb.setKeyVal('activeAccountId', accountId);
      const isValidActiveAccountIdInDb = await waitForTruthy(
        async () => (await sharedDb.getKeyVal('activeAccountId')) === accountId
      );
      if (!isValidActiveAccountIdInDb) {
        throw new Error('Failed to write activeAccountId to db');
      }
      logEvent({
        type: 'success',
        message: 'activeAccountId written to db',
      });
      initStoreSync();
    }

    logEvent({
      message: `Creating account with id: Account-${accountId}`,
    });

    try {
      const { pkInstance: rootKey } = createHDPrivateKey({
        networkId,
        passphrase,
        mnemonic: rebuildMnemonic(mnemonicPhrase.trim()),
      });

      if (action === 'createNew') {
        logEvent({
          message: 'Creating a new wallet...',
          showToUser: true,
        });
        const newWallet = this.createWallet(rootKey);
        this.walletList.push(newWallet);
      } else {
        logEvent({
          message: 'Importing existing wallet...',
          showToUser: true,
        });

        // Restoring wallets
        store.dispatch(setIsHistoryFetching(true));
        await this.getWalletsWithHistory({ rootKey, networkId });

        if (this.walletList.length) {
          logEvent({
            message: `Restored ${this.walletList.length} wallet(s) with history.`,
            showToUser: true,
          });
        } else {
          this.walletList.push(this.createWallet(rootKey));
        }

        store.dispatch(setIsHistoryFetching(false));
      }

      const isDataWritten = await this.storeAccountData({
        accountId,
        accountName,
        hasPassphrase: !!passphrase,
        networkId,
        privateKeyHash: rootKey.toString(),
        privateKeyEncrypted: encrypt(rootKey.toString(), password),
      });

      if (isDataWritten) {
        logEvent({
          type: 'success',
          message: 'Account created',
          showToUser: true,
        });
        setTimeout(() => {
          store.dispatch(setIsCreating(false));
        }, this.timeoutMultiplier * 500);
        return {
          success: true,
          data: {
            accountId,
            accountName,
            networkId,
          },
        };
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      logEvent({
        type: 'error',
        message,
        showToUser: true,
      });
      console.error('onboardingForm', err);
      this.revert({
        previousAccountId,
        accountId,
      });
      return {
        success: false,
        error: {
          message,
        },
      };
    }
  };

  private async storeAccountData({
    accountId,
    accountName,
    hasPassphrase,
    networkId,
    privateKeyHash,
    privateKeyEncrypted,
  }: AccountData) {
    const network = networkList.find(item => item.id === networkId);

    if (!network) {
      throw new Error('Network not found');
    }
    const lastAddress = this.walletList[this.walletList.length - 1]?.address;

    await sharedDb.insertAccount({
      id: accountId,
      name: accountName,
      hasPassphrase,
      networkId,
    });

    logEvent({
      message: `Switching to new account #${accountId}`,
    });

    // if this is NOT first account, this will write 'activeAccountId' to db
    await db.useAccount(accountId, true);

    logEvent({
      message: 'Clearing state...',
    });

    // we need to clear state if we switch account on background
    await dispatchAndValidate(
      clearState(),
      s =>
        Object.keys(s.pk.map).length === 0 &&
        isNull(s.pk.rootPk) &&
        isNull(s.pk.activePk) &&
        isNull(s.pk.network)
    );

    await dispatchAndValidate(
      setState({
        isLocked: false,
      }),
      s => s.pk.isLocked === false
    );

    const isValidActiveAccountIdInDb = await waitForTruthy(
      async () => (await sharedDb.getKeyVal('activeAccountId')) === accountId
    );

    if (isValidActiveAccountIdInDb) {
      logEvent({
        type: 'success',
        message: 'activeAccountId written to db',
      });
    } else {
      throw new Error('Failed to write activeAccountId to db');
    }

    // storeSync will write 'rootPk.privateKeyEncrypted' to db
    const isPkDispatchSuccess = await dispatchAndValidate(
      setRootPK({
        privateKeyHash,
        privateKeyEncrypted,
      }),
      s => s.pk.rootPk.privateKeyEncrypted === privateKeyEncrypted
    );

    if (!isPkDispatchSuccess) {
      throw new Error('Failed to dispatch Root PK');
    }

    // let's wait for PK to be written to db
    await delay(this.timeoutMultiplier * 200);

    const isValidPkEncryptedInDb = await waitForTruthy(
      async () => (await db.getKeyVal('rootPk.privateKeyEncrypted')) === privateKeyEncrypted
    );

    if (isValidPkEncryptedInDb) {
      logEvent({
        type: 'success',
        message: 'rootPk.privateKeyEncrypted written to db',
      });
    } else {
      throw new Error('Failed to write rootPk.privateKeyEncrypted to db');
    }

    // storeSync will write 'network.id' to db
    const isNetworkIdDispatched = await dispatchAndValidate(
      setNetwork(network),
      s => s.pk?.network?.id === networkId
    );

    if (!isNetworkIdDispatched) {
      throw new Error('Failed to dispatch network.id');
    }

    // let's wait for network to be set in db
    await delay(this.timeoutMultiplier * 500);

    // this does not write to db
    const isActiveAccountIdDispatched = await dispatchAndValidate(
      setActiveAccountId(accountId),
      s => s.account.activeAccountId === accountId
    );

    if (!isActiveAccountIdDispatched) {
      throw new Error('Failed to dispatch activeAccountId');
    }

    // this creates account record in db
    const isAccountDispatched = await dispatchAndValidate(
      addAccount({
        id: accountId,
        name: accountName,
        hasPassphrase,
        networkId,
      }),
      s => !!s.account.accountMap[accountId]
    );

    if (!isAccountDispatched) {
      throw new Error('Failed to dispatch account');
    }

    delay(this.timeoutMultiplier * 500);

    const isValidAccountInDb = await waitForTruthy(async () => {
      const accountFromDb = await sharedDb.getAccount(accountId);
      return (
        (accountFromDb && accountFromDb.name === accountName && accountFromDb.networkId === networkId) ||
        false
      );
    });

    if (isValidAccountInDb) {
      logEvent({
        type: 'success',
        message: 'account written to db',
      });
    } else {
      throw new Error('Failed to write account to db');
    }

    // this writes to db
    const hasPkListItems = await dispatchAndValidate(
      appendPKList(this.walletList),
      s =>
        this.walletList.every(item => !!s.pk.map[item.address]) &&
        Object.values(s.pk.map)?.length === this.walletList.length
    );

    if (!hasPkListItems) {
      throw new Error('Failed to write PKList to db');
    }

    // this writes active.PkAddress to db

    lastAddress &&
      (await dispatchAndValidate(setActivePk(lastAddress), s => s.pk.activePk.address === lastAddress));

    // wait for PkAddress to be set in db
    await delay(this.timeoutMultiplier * 200);

    const isValidActivePkAddressInDb = await waitForTruthy(
      async () => (await db.getKeyVal('active.PkAddress')) === lastAddress
    );

    if (isValidActivePkAddressInDb) {
      logEvent({
        type: 'success',
        message: 'active.PkAddress written to db',
      });
    } else {
      throw new Error('Failed to write active.PkAddress to db');
    }

    return true;
  }

  private async getWalletsWithHistory({ rootKey, networkId }: { rootKey: HDPrivateKey; networkId: string }) {
    return new Promise(resolve => {
      let i = 0;

      const fn = async () => {
        if (this.noHistoryCount === EMPTY_WALLETS_SLOT_COUNT) {
          resolve(true);
        } else {
          const wallet = this.createWallet(rootKey, i);

          const hasHistory = await this.hasWalletHistory({ address: wallet.address, networkId });

          logEvent({
            message: `Fetching history for wallet #${i}: ${wallet.address}. ${
              hasHistory ? 'Found some history' : 'No history'
            }`,
          });

          if (hasHistory) {
            this.walletList.push(wallet);
            store.dispatch(setRestoredWalletsCount(this.walletList.length));
            this.noHistoryCount = 0;
          } else {
            // console.log('creating a wallet', i, wallet, 'has NO history');
            this.noHistoryCount++;
          }
          store.dispatch(setAccountCreationDerivationPathLastIndex(i));
          i++;
          setTimeout(fn, this.timeoutMultiplier * 400);
        }
      };

      fn();
    });
  }

  private async hasWalletHistory({
    address,
    networkId,
  }: {
    address: string;
    networkId: string;
  }): Promise<boolean> {
    let retryCount = 0;
    let result = false;

    while (retryCount < 3) {
      const { status, data } = await getHistory({ address, networkId });

      if (retryCount > 0) {
        logEvent({
          message: `Retrying history fetch for wallet ${address} (${retryCount}).`,
          showToUser: true,
        });
      }

      if (status === 'fulfilled') {
        result = data?.length > 0;
        break;
      } else {
        retryCount++;
        await delay(this.timeoutMultiplier * 500);
      }
    }

    return result;
  }

  public createWallet(rootKey: HDPrivateKey, index = 0): PKType {
    if (!rootKey) {
      throw new Error('rootKey is empty');
    }

    const { address, name, path } = derivePk({
      rootKey,
      path: `0'/0/${index}`,
    });

    return {
      address,
      name,
      path,
      balance: {
        satoshis: null,
        updatedAt: null,
      },
    };
  }

  public async revert({ previousAccountId, accountId }: { previousAccountId: string; accountId: string }) {
    if (previousAccountId) {
      store.dispatch(clearState());
      await db.useAccount(previousAccountId);
      store.dispatch(setActiveAccountId(previousAccountId));
    } else {
      store.dispatch(setActiveAccountId(null));
    }

    sharedDb.deleteAccount(accountId);
    db.deleteAccountDb(accountId);
  }
}
