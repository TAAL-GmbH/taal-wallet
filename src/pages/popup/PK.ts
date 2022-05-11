import { WOC } from './WOCLib';

export class PK {
  pk: { privateKey: HDPK } | undefined;
  address: string | undefined;

  async unspent(address: string) {
    let woc = new WOC();
    return await woc.unspent(address || this.address);
  }

  async sendBSV(amount: string, destination: string) {
    if (!this.address) {
      throw new Error('address not set');
    }
    if (!this.pk?.privateKey) {
      throw new Error('address not set');
    }
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
        .sign(this.pk?.privateKey);
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
