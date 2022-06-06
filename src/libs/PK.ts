import { PK_CURRENT_KEY, PK_LIST_KEY } from '@/src/constants';
import { replacePKList, appendPK, setActivePk } from '@/src/features/pkSlice';
import { store } from '@/src/store';
import isEqual from 'react-fast-compare';
import { BStorePKType, PKType } from '../types';
import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';
// import cryptoBrowserify from 'crypto-browserify';
import crypto from 'crypto';
import { decryptPK, encryptPK } from '../utils/crypt';

class PK {
  private _isInitialized = false;

  public async init(callerName: string) {
    // console.log(`pk.init`, { callerName });
    if (this._isInitialized) {
      return;
    }

    this._isInitialized = true;
  }

  public generateMnemonic() {
    return bsv.Mnemonic.fromRandom();
  }

  public createHDPrivateKey({
    mnemonic,
    network = 'testnet',
    password = '',
  }: {
    mnemonic: Mnemonic;
    network?: string;
    password?: string;
  }) {
    // @ts-ignore
    window.bsv = bsv;

    const mSeed = mnemonic.toSeed(password);
    const masterPrivateKey = bsv.HDPrivateKey.fromSeed(mSeed, network);
    const address = masterPrivateKey.publicKey.toAddress(network).toString();

    // another way of doing the same thing
    // const hDPrivateKey2 = mnemonic.toHDPrivateKey(password, network);
    // var copy_of_child_0_1_2h = hDPrivateKey2.deriveChild("m/0/1/2'");

    // const child_0_1_2h = masterPrivateKey
    //   .deriveChild(0)
    //   .deriveChild(1)
    //   .deriveChild(2, true);

    console.log('createHDPrivateKey', {
      address,
      path: 'm',
      network,
      privateKey: masterPrivateKey.toString(),
      name: Date.now().toString(),
      balance: {
        updatedAt: null,
        amount: null,
      },
    });

    store.dispatch(
      appendPK({
        address,
        path: 'm',
        network,
        privateKey: masterPrivateKey.toString(),
        name: 'Master Key',
        balance: {
          updatedAt: null,
          amount: null,
        },
      })
    );
  }

  /**
   * This function is used to convert PK data structure from browser storage to redux
   * @param bStoreData
   * @returns
   */
  public bStorePK2PKType(bStoreData: BStorePKType): PKType {
    const { name, network, path, balance, privateKeyEncrypted } = bStoreData;
    const privateKey = decryptPK(privateKeyEncrypted);
    const hdPk = bsv.HDPrivateKey.fromString(privateKey);
    return {
      name,
      network,
      address: hdPk.publicKey.toAddress(network).toString(),
      balance,
      path,
      privateKey,
    };
  }

  public pkType2BStore(pkData: PKType): BStorePKType {
    const { name, path, network, privateKey, balance } = pkData;
    return {
      name,
      path,
      network,
      balance,
      privateKeyEncrypted: encryptPK(privateKey),
    };
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
