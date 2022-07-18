import { HDPrivateKey } from 'bsv';
import { networkList } from '../constants/networkList';
import { routes } from '../constants/routes';
import { db } from '../db';
import { sharedDb } from '../db/shared';
import { addAccount, setActiveAccountId } from '../features/accountSlice';
import { appendPKList, setActivePk, setNetwork, setRootPK } from '../features/pkSlice';
import { getHistory } from '../features/wocApiSlice';
import { store } from '../store';
import { PKType } from '../types';
import { createHDPrivateKey, derivePk, rebuildMnemonic } from '../utils/blockchain';
import { isBackgroundPageResponding } from '../utils/communication';
import { encrypt } from '../utils/crypt';
import { navigateTo } from '../utils/navigation';
import { createToast } from '../utils/toast';

type AccountData = {
  accountId: string;
  accountName: string;
  networkId: string;
  privateKeyHash: string;
  privateKeyEncrypted: string;
  walletList: PKType[];
};

type CreateAccountOptions = {
  accountName: string;
  networkId: string;
  password: string;
  mnemonicPhrase: string;
  action: 'importExisting' | 'createNew';
};

export const useFactory = () => {
  const createAccount = async (values: CreateAccountOptions) => {
    const { networkId, password, mnemonicPhrase, action } = values;
    const toast = createToast('Creating Root Key...');

    const accountName = values.accountName.trim();

    if (!mnemonicPhrase) {
      toast.error('mnemonic is empty');
      return;
    }

    if (!(await isBackgroundPageResponding())) {
      toast.error('Background page is not responding.');
      navigateTo(routes.ERROR);
      return;
    }

    try {
      const network = networkList.find(item => item.id === networkId);

      const { pkInstance: rootKey } = createHDPrivateKey({
        networkId,
        password,
        mnemonic: rebuildMnemonic(mnemonicPhrase.trim()),
      });

      const accountId = `${Date.now()}`;

      // await sharedDb.insertAccount({
      //   id: accountId,
      //   name: accountName,
      //   networkId,
      // });

      // // it's important to await for background to switch database
      // // this will write 'activeAccountId' to db
      // await db.useAccount(accountId, true);

      // // storeSync will write 'rootPk.privateKeyEncrypted' to db
      // store.dispatch(
      //   setRootPK({
      //     privateKeyHash: rootKey.toString(),
      //     privateKeyEncrypted: encrypt(rootKey.toString(), password),
      //   })
      // );

      // // storeSync will write 'network.id' to db
      // store.dispatch(setNetwork(network));

      // // this does not write to db
      // store.dispatch(setActiveAccountId(accountId));

      // // this creates account record in db
      // store.dispatch(
      //   addAccount({
      //     id: accountId,
      //     name: accountName,
      //     networkId,
      //   })
      // );

      toast.success('Root Key created');

      let walletList: PKType[];

      if (action === 'createNew') {
        const toast = createToast('Creating wallet...');
        const newWallet = createWallet(rootKey);
        walletList = [newWallet];
        toast.success('Wallet created');
      } else {
        // Restoring wallets
        const toast = createToast('Restoring wallets...');
        walletList = await getWalletsWithHistory(rootKey);

        if (!walletList.length) {
          walletList.push(createWallet(rootKey));
        }

        toast.success(`${walletList.length} wallet(s) restored`);
      }

      // // this writes to db
      // store.dispatch(appendPKList(walletList));

      // // this writes active.PkAddress to db
      // store.dispatch(setActivePk(lastAddress));

      const isDataWritten = await storeAccountData({
        accountId,
        accountName,
        networkId,
        privateKeyHash: rootKey.toString(),
        privateKeyEncrypted: encrypt(rootKey.toString(), password),
        walletList,
      }).catch(toast.error);

      if (isDataWritten) {
        navigateTo(routes.HOME);
      }
    } catch (err) {
      console.error('onboardingForm', err);
      toast.error(err.message);
    }
  };

  const storeAccountData = async ({
    accountId,
    accountName,
    networkId,
    privateKeyHash,
    privateKeyEncrypted,
    walletList,
  }: AccountData) => {
    const network = networkList.find(item => item.id === networkId);
    const lastAddress = walletList[walletList.length - 1].address;

    await sharedDb.insertAccount({
      id: accountId,
      name: accountName,
      networkId,
    });

    // it's important to await for background to switch database
    // this will write 'activeAccountId' to db
    await db.useAccount(accountId, true);

    // storeSync will write 'rootPk.privateKeyEncrypted' to db
    store.dispatch(
      setRootPK({
        privateKeyHash,
        privateKeyEncrypted,
      })
    );

    // storeSync will write 'network.id' to db
    store.dispatch(setNetwork(network));

    // this does not write to db
    store.dispatch(setActiveAccountId(accountId));

    // this creates account record in db
    store.dispatch(
      addAccount({
        id: accountId,
        name: accountName,
        networkId,
      })
    );

    // this writes to db
    store.dispatch(appendPKList(walletList));

    // this writes active.PkAddress to db
    store.dispatch(setActivePk(lastAddress));

    return true;
  };

  const getWalletsWithHistory = async (rootKey: HDPrivateKey): Promise<PKType[]> => {
    // TODO: this function fetches only first 20 wallets
    const walletList: PKType[] = [];

    // TODO: there is request limit of 10 per second (?)
    for (let i = 0; i < 10; i++) {
      walletList.push(createWallet(rootKey, i));
    }

    const historyFetchResultList = await Promise.all(walletList.map(wallet => getHistory(wallet.address)));

    console.log({ historyFetchResultList });
    const addressWithHistoryList = historyFetchResultList
      .filter(({ status, data }) => status === 'fulfilled' && data?.length > 0)
      .map(({ originalArgs }) => originalArgs);

    return walletList.filter(({ address }) => addressWithHistoryList.includes(address));
  };

  const createWallet = (rootKey: HDPrivateKey, index = 0): PKType => {
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
        amount: null,
        updatedAt: null,
      },
    };
  };

  return {
    createAccount,
  };
};
