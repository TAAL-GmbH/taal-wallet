import { PK_CURRENT_KEY, PK_LIST_KEY } from '@/src/constants';
import { replacePKList, appendPK, setActivePk } from '@/src/features/pkSlice';
import { store } from '@/src/store';
import isEqual from 'react-fast-compare';
import { HDPrivateKey, Mnemonic, PKType } from '../types';

const storageSyncKeys = [PK_LIST_KEY, PK_CURRENT_KEY];

class PK {
  public async init() {
    /**
     * The following code it to keep in sync redux state -> chrome.storage.pk
     */
    store.subscribe(async () => {
      const { list, current } = store.getState().pk;

      const storageData = await chrome.storage.local.get(storageSyncKeys);

      const newStorageData: {
        [PK_LIST_KEY]?: PKType[];
        [PK_CURRENT_KEY]?: PKType | null;
      } = {};

      if (!isEqual(storageData[PK_LIST_KEY], list)) {
        newStorageData[PK_LIST_KEY] = list;
      }

      if (current && storageData[PK_CURRENT_KEY] !== current) {
        newStorageData[PK_CURRENT_KEY] = current;
      }

      if (Object.keys(newStorageData).length) {
        chrome.storage.local.set(newStorageData);
      }
    });

    /**
     * The following code it to keep in sync chrome.storage.pk -> redux state
     */
    chrome.storage.onChanged.addListener(
      async (changes: { [key: string]: chrome.storage.StorageChange }) => {
        for (let [key, { newValue }] of Object.entries(changes)) {
          if (key === PK_LIST_KEY) {
            store.dispatch(replacePKList(newValue as PKType[]));
          }
          if (key === PK_CURRENT_KEY) {
            store.dispatch(setActivePk(newValue));
          }
        }
      }
    );

    /**
     * The following code it to restore data from chrome.storage.pk -> redux state
     */
    const localStorageData = await chrome.storage.local.get(storageSyncKeys);

    if (localStorageData[PK_LIST_KEY]?.length) {
      store.dispatch(replacePKList(localStorageData[PK_LIST_KEY]));
    }
    if (localStorageData[PK_CURRENT_KEY]) {
      store.dispatch(setActivePk(localStorageData[PK_CURRENT_KEY]));
    }
  }

  public generateMnemonic() {
    return bsvMnemonic.fromRandom();
  }

  public createHDPK({
    mnemonic,
    network = 'testnet',
  }: {
    mnemonic: Mnemonic;
    network?: string;
  }) {
    const privateKey: HDPrivateKey = mnemonic.toHDPrivateKey();
    const address = privateKey.publicKey.toAddress(network).toString();
    store.dispatch(
      appendPK({
        address,
        pk: privateKey.toString(),
        name: Date.now().toString(),
        balance: null,
      })
    );
  }

  public restorePK() {
    const pkString = store.getState().pk.current?.pk;
    if (pkString) {
      const pk = bsv.HDPrivateKey.fromString(pkString);
      console.log({ pk });
      return pk;
    }
  }
}

export const pk = new PK();

/*
class PK_org {
  pk;
  address;

  async unspent(address) {
    let woc = new WOC();
    return await woc.unspent(address || this.address);
  }

  async sendBSV(amount, destination) {
    try {
      bsv.Address.fromString(destination);
    } catch (e) {
      alert('Invalid destination address');
      return new Error('Invalid destination address');
    }

    try {
      const woc = new WOC();

      let unspents = await this.unspent(this.address);

      let u = unspents[0];
      let unspentTXHash = u.tx_hash;
      let unspentVOutIndex = u.tx_pos;
      let unspentValue = u.value;
      let unspentTX = await woc.tx(unspentTXHash);

      let utxo = new bsv.Transaction.UnspentOutput({
        txId: unspentTXHash,
        outputIndex: unspentVOutIndex,
        address: this.address,
        script: unspentTX.vout[unspentVOutIndex].scriptPubKey.hex,
        satoshis: unspentValue,
      });
      let tx = new bsv.Transaction()
        .from(utxo)
        .to(destination, parseInt(amount))
        .change(this.address)
        .sign(this.pk.privateKey);
      let chain = new Chain();
      return await chain.broadcast(tx);
    } catch (err) {
      throw err;
    }
  }

  async balanceAsync(source) {
    const woc = new WOC();
    return await woc.balanceAsync(source, this.address);
  }

  async balance(address) {
    const woc = new WOC();
    return await woc.balance(address || this.address);
  }

  retrievePK(source) {
    this.retrievePKFromStorage(
      result => {
        this.pk = bsv.HDPrivateKey.fromString(result.pk);
        this.address = this.pk.publicKey.toAddress(network).toString();
        source.pkRetrievedListener();
      },
      () => {
        source.pkNotFoundListener(source);
      }
    );
  }

  retrievePKFromStorage(success, failure) {
    chrome.storage.local.get('pk', pkAsString => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        failure();
        return;
      }
      if (!pkAsString.pk) {
        failure();
        return;
      }
      success(pkAsString);
    });
  }

  storePk(pk, success, failure) {
    chrome.storage.local.set({ pk: pk.toString() }, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        failure();
        return;
      }
      success();
    });
  }

  storeAddress(address, success, failure) {
    chrome.storage.local.set({ address: address.toString() }, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        failure();
        return;
      }
      success();
    });
  }

  createPK() {
    let mnem = bsvMnemonic.fromRandom();
    this.pk = mnem.toHDPrivateKey();
    this.address = this.pk.publicKey.toAddress(network).toString();
    console.log('pk: ' + this.pk);
    this.storePk(
      this.pk,
      () => {
        console.log('PK stored');
      },
      () => {
        console.log('error storing pk');
      }
    );

    this.storeAddress(
      this.address,
      () => {
        console.log('Address stored');
      },
      () => {
        console.log('error storing address');
      }
    );

    return mnem.toString();
  }
}
*/
