class ApiError extends Error {
  constructor(statusCode, details, url) {
    super();
    this.details = details || {};
    this.statusCode = statusCode;
    this.message = `Taal Api error :${url}, details: ${JSON.stringify(
      this.details
    )}, statusCode : ${this.statusCode}`;
  }
}
const network = 'testnet';
const parseJson = async response => {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (err) {
    if (response.ok) {
      return { ok: response.ok, data: { status: response.status, text } };
    }
    throw err;
  }
};

const request = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options); // eslint-disable-line
    response = await parseJson(response);

    if (response.ok) {
      return response.data;
    }
    throw response;
  } catch (error) {
    throw new ApiError(response.status, error?.data, url);
  }
};

class TokenBalance {
  symbol;
  balance;
}

class Balance {
  satoshis;
  tokenBalances;
}

class TokenUnspent {
  redeemAddr;
  symbol;
  txid;
  index;
  amount;
}

class WOC {
  async tx(hash) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/tx/hash/' + hash;
    try {
      const data = await request(endpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async unspent(address) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/unspent';

    try {
      const data = await request(endpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async unspentTokens(address) {
    const tokenEndpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/tokens/unspent';

    try {
      const data = await request(tokenEndpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async balanceAsync(source, address) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/balance';
    let satoshis;

    try {
      const balance = await request(endpoint);
      satoshis = balance.confirmed + balance.unconfirmed;

      const tokenEndpoint =
        'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
        address +
        '/tokens';
      let tokenBalances = [];
      try {
        const tokenBalancesResponse = await request(tokenEndpoint);
        if (tokenBalancesResponse.tokens) {
          for (let i = 0; i < tokenBalancesResponse.tokens.length; i++) {
            let tokenBalance = new TokenBalance();
            tokenBalance.symbol = tokenBalancesResponse.tokens[i].symbol;
            tokenBalance.balance = tokenBalancesResponse.tokens[i].tokenBalance;
            tokenBalances.push(tokenBalance);
          }
        }
        let totalBalance = new Balance();
        totalBalance.satoshis = satoshis;
        totalBalance.tokenBalances = tokenBalances;
        source.refreshBalanceListener(totalBalance);
      } catch (err) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }

  async balance(address) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/balance';
    let satoshis;

    try {
      const balance = await request(endpoint);
      satoshis = balance.confirmed + balance.unconfirmed;
      return satoshis;
    } catch (err) {
      throw err;
    }
  }

  async tokens(address) {
    const tokenEndpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/tokens';
    let tokenBalances = [];

    try {
      const tokenBalancesResponse = await request(tokenEndpoint);
      if (tokenBalancesResponse.tokens) {
        for (let i = 0; i < tokenBalancesResponse.tokens.length; i++) {
          let tokenBalance = new TokenBalance();
          tokenBalance.symbol = tokenBalancesResponse.tokens[i].symbol;
          tokenBalance.balance = tokenBalancesResponse.tokens[i].tokenBalance;
          tokenBalances.push(tokenBalance);
        }
      }
      return tokenBalances;
    } catch (err) {
      return null;
    }
  }
}

class PK {
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

class Chain {
  async airdrop(address) {
    let endpoint = 'https://taalnet.whatsonchain.com/faucet/send/' + address;
    let txid;

    try {
      const { text } = await request(endpoint, {
        headers: {
          Authorization: `Basic ${btoa('taal_private:dotheT@@l007')}`,
        },
      });
      txid = text;
    } catch (err) {
      throw err;
    }

    // Check this is a valid hex string
    if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Failed to get funds: ${txid}`);
    }
  }

  async broadcast(tx) {
    tx = tx.toString('hex');
    const endpoint = `https://taalnet.whatsonchain.com/v1/bsv/taalnet/tx/raw?dontcheckfee=true`;
    let txid;

    let body = JSON.stringify({
      txhex: tx,
    });

    try {
      txid = await request(endpoint, {
        method: 'POST',
        body: body,
        headers: {
          Authorization: `Basic ${btoa(`taal_private:dotheT@@l007`)}`,
        },
      });
    } catch (err) {
      throw err;
    }

    if (txid[0] === '"') {
      txid = txid.slice(1);
    }
    if (txid.slice(-1) === '\n') {
      txid = txid.slice(0, -1);
    }
    if (txid.slice(-1) === '"') {
      txid = txid.slice(0, -1);
    }
    // Check this is a valid hex string
    if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Failed to broadcast: ${txid}`);
    }
    return txid;
  }
}

class Token {
  async sendToken(pk, symbol, amount, destination) {
    try {
      bsv.Address.fromString(destination);
    } catch (e) {
      throw new Error('Invalid destination address');
    }

    try {
      let woc = new WOC();
      let unspentTokens;
      try {
        unspentTokens = await woc.unspentTokens(pk.address);
      } catch (err) {
        throw err;
      }
      let chosentokenUnspent;
      let found = false;
      for (let i = 0; i < unspentTokens.utxos.length; i++) {
        if (unspentTokens.utxos[i].symbol === symbol) {
          chosentokenUnspent = unspentTokens.utxos[i];
          found = true;
        }
      }
      if (!found) {
        throw new Error('No unspent for symbol ' + symbol);
      }

      let splitDestinations = [];
      splitDestinations[0] = {
        address: destination,
        amount: amount / 100000000,
      };
      splitDestinations[1] = {
        address: pk.address,
        amount: (chosentokenUnspent.amount - amount) / 100000000,
      };

      let unspents;
      try {
        unspents = await woc.unspent(pk.address);
      } catch (err) {
        throw err;
      }
      if (unspents.length < 1) {
        throw new Error('Error: needs 1+ unspents');
      }
      let stasUTXO = await this.makeUTXOFromSTATSUnspent(
        chosentokenUnspent,
        woc
      );
      let paymentUtxo = await this.makeUTXO(unspents[0], woc);

      let splitHex = split(
        pk.pk.privateKey,
        stasUTXO,
        splitDestinations,
        paymentUtxo,
        pk.pk.privateKey
      );

      let chain = new Chain();
      await chain.broadcast(splitHex);
    } catch (err) {
      throw err;
    }
  }

  async makeUTXOFromSTATSUnspent(unspent, woc) {
    try {
      let unspentTXHash = unspent.txid;
      let unspentVOutIndex = unspent.index;
      let unspentTX = await woc.tx(unspentTXHash);

      return {
        txid: unspentTXHash,
        vout: unspentVOutIndex,
        scriptPubKey: unspentTX.vout[unspentVOutIndex].scriptPubKey.hex,
        amount: unspentTX.vout[unspentVOutIndex].value,
      };
    } catch (err) {
      throw err;
    }
  }

  async getFundsFromFaucet(address) {
    const url = `https://taalnet.whatsonchain.com/faucet/send/${address}`;
    let txid;

    try {
      const { text } = await request(url, {
        headers: {
          Authorization: `Basic ${btoa(`taal_private:dotheT@@l007`)}`,
        },
      });
      txid = text;
    } catch (err) {
      throw err;
    }

    // Check this is a valid hex string
    if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Failed to get funds: ${txid}`);
    }

    let woc = new WOC();

    let faucetTx;
    try {
      faucetTx = await woc.tx(txid);
    } catch (err) {
      throw err;
    }

    let vout = 0;
    if (faucetTx.vout[0].value !== 0.01) {
      vout = 1;
    }

    return [
      {
        txid,
        vout,
        scriptPubKey: faucetTx.vout[vout].scriptPubKey.hex,
        amount: faucetTx.vout[vout].value,
      },
    ];
  }

  utilsSchema(publicKeyHash, symbol, supply) {
    const schema = {
      name: 'Taal Token',
      tokenId: `${publicKeyHash}`,
      protocolId: 'To be decided',
      symbol: `${symbol}`,
      description: 'Example token on private Taalnet',
      image: './favicon.ico',
      totalSupply: supply,
      decimals: 0,
      satsPerToken: 1,
      properties: {
        legal: {
          terms:
            '© 2020 TAAL TECHNOLOGIES SEZC\nALL RIGHTS RESERVED. ANY USE OF THIS SOFTWARE IS SUBJECT TO TERMS AND CONDITIONS OF LICENSE. USE OF THIS SOFTWARE WITHOUT LICENSE CONSTITUTES INFRINGEMENT OF INTELLECTUAL PROPERTY. FOR LICENSE DETAILS OF THE SOFTWARE, PLEASE REFER TO: www.taal.com/stas-token-license-agreement',
          licenceId: '1234',
        },
        issuer: {
          organisation: 'Taal Technologies SEZC',
          legalForm: 'Limited Liability Public Company',
          governingLaw: 'CA',
          mailingAddress: '1 Volcano Stret, Canada',
          issuerCountry: 'CYM',
          jurisdiction: '',
          email: 'info@taal.com',
        },
        meta: {
          schemaId: 'token1',
          website: 'https://taal.com',
          legal: {
            terms: 'blah blah',
          },
          media: {
            type: 'mp4',
          },
        },
      },
    };
    return schema;
  }

  getIssueInfo(addr1, sat1) {
    return [
      {
        addr: addr1,
        satoshis: sat1,
        data: 'one',
      },
    ];
  }

  getUtxo(txid, tx, vout) {
    return {
      txid: txid,
      vout: vout,
      scriptPubKey: tx.vout[vout].scriptPubKey.hex,
      amount: tx.vout[vout].value,
    };
  }

  async mint(pk) {
    let chain = new Chain();
    let woc = new WOC();

    let pkUnspents;
    try {
      pkUnspents = await woc.unspent(pk.address);
    } catch (err) {
      throw err;
    }
    if (pkUnspents.length < 1) {
      throw new Error('Error: needs 1+ unspents');
    }

    let tokenBalances;
    try {
      tokenBalances = await woc.tokens(pk.address);
    } catch (err) {
      throw err;
    }

    let symbol;
    if (!tokenBalances.length) {
      symbol = 'TOKEN-0';
    } else {
      symbol = 'TOKEN-' + (tokenBalances.length + 1);
    }

    try {
      const issuerPrivateKey = pk.pk.privateKey;
      const fundingPrivateKey = pk.pk.privateKey;

      const receiverPrivateKey = pk.pk.privateKey;
      const receiverAddr = receiverPrivateKey.toAddress(network).toString();

      const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(
        pk.pk.publicKey.toBuffer()
      ).toString('hex');
      const lockingScript = bsv.Script.fromASM(
        `OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`
      );

      const contractUtxos = [
        {
          txid: pkUnspents[0].tx_hash,
          vout: pkUnspents[0].tx_pos,
          scriptPubKey: lockingScript.toHex(),
          amount: pkUnspents[0].value / SATS_PER_BITCOIN,
        },
      ];
      const fundingUtxos = [
        {
          txid: pkUnspents[1].tx_hash,
          vout: pkUnspents[1].tx_pos,
          scriptPubKey: lockingScript.toHex(),
          amount: pkUnspents[1].value / SATS_PER_BITCOIN,
        },
      ];

      const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(
        issuerPrivateKey.publicKey.toBuffer()
      ).toString('hex');
      const supply = 10000;
      const schema = this.utilsSchema(publicKeyHash, symbol, supply);

      // change goes back to the fundingPrivateKey
      const contractHex = contract(
        issuerPrivateKey,
        contractUtxos,
        fundingUtxos,
        fundingPrivateKey,
        schema,
        supply
      );

      const contractTxid = await chain.broadcast(contractHex);

      const contractTx = await woc.tx(contractTxid);

      const issueHex = issue(
        issuerPrivateKey,
        this.getIssueInfo(receiverAddr, supply),
        this.getUtxo(contractTxid, contractTx, 0),
        this.getUtxo(contractTxid, contractTx, 1),
        fundingPrivateKey,
        true,
        symbol,
        2
      );

      await chain.broadcast(issueHex);

      return symbol;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async makeUTXO(unspent, woc) {
    try {
      let unspentTXHash = unspent.tx_hash;
      let unspentVOutIndex = unspent.tx_pos;

      let unspentTX = await woc.tx(unspentTXHash);

      return {
        txid: unspentTXHash,
        vout: unspentVOutIndex,
        scriptPubKey: unspentTX.vout[unspentVOutIndex].scriptPubKey.hex,
        amount: unspentTX.vout[unspentVOutIndex].value,
      };
    } catch (err) {
      throw err;
    }
  }
}
