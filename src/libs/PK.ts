import { appendPK, setActivePk, setRootPK } from '@/src/features/pkSlice';
import { store } from '@/src/store';
import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';
import { db } from '../db';
import { encrypt } from '../utils/crypt';
class PK {
  private _isInitialized = false;

  public async init() {
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
    password,
    name = 'Master Key',
  }: {
    mnemonic: Mnemonic;
    network?: string;
    password?: string;
    name?: string;
  }) {
    // @ts-ignore
    window.bsv = bsv;

    const path = 'm';

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
      name,
      address,
      path,
      network,
      privateKey: masterPrivateKey.toString(),
      balance: {
        updatedAt: null,
        amount: null,
      },
    });

    store.dispatch(
      setRootPK({
        privateKeyHash: masterPrivateKey.toString(),
      })
    );

    db.setKeyVal(
      'rootPk.privateKeyEncrypted',
      encrypt(masterPrivateKey.toString(), password)
    );

    return {
      pkInstance: masterPrivateKey,
      name,
      path,
      network,
    };
  }

  public derive({
    name = `Key-${Date.now()}`,
    masterKey,
    path,
    network,
  }: {
    name?: string;
    masterKey: bsv.HDPrivateKey;
    path: string;
    network: string;
  }) {
    // m / purpose' / coin_type' / account' / change / address_index
    // m / 44 / 236 / 0' / 0 / 0
    const pathSegments = path.split('/');
    if (pathSegments.length === 3) {
      pathSegments.unshift('m', "44'", "236'");
    }

    const fullPath = pathSegments.join('/');

    if (pathSegments.length !== 6) {
      console.log({ pathSegments });
      throw new Error(`Invalid path: ${fullPath}`);
    }

    const key = masterKey.deriveChild(fullPath);
    const address = key.publicKey.toAddress(network).toString();
    const result = {
      address,
      path: fullPath,
      network,
      privateKey: key.toString(),
      name,
      balance: {
        updatedAt: null,
        amount: null,
      },
    };

    db.setKeyVal(
      'derivationPath.lastIndex',
      parseInt(pathSegments[pathSegments.length - 1])
    );
    store.dispatch(appendPK(result));
    store.dispatch(setActivePk(address));
    return result;
  }

  public restorePK(privateKey: string) {
    return bsv.HDPrivateKey.fromString(privateKey);
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
