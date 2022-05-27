const basePath = 'https://taalnet.whatsonchain.com';

const parseJsonLocal = async (response: Response) => {
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

const requestLocal = async (url: string, options = {}) => {
  let response;
  try {
    response = await fetch(url, options); // eslint-disable-line
    response = await parseJsonLocal(response);

    if (response.ok) {
      return response.data;
    }
    throw response;
  } catch (error) {
    throw new ApiError(response.status, error?.data, url);
  }
};

class WOC {
  async tx(hash: string) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/tx/hash/' + hash;
    try {
      const data = await requestLocal(endpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async unspent(address: string) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/unspent';

    try {
      const data = await requestLocal(endpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async unspentTokens(address: string) {
    const tokenEndpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/tokens/unspent';

    try {
      const data = await requestLocal(tokenEndpoint);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async balanceAsync(source: string, address: string) {
    const endpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/balance';
    let satoshis;

    try {
      const balance = await requestLocal(endpoint);
      satoshis = balance.confirmed + balance.unconfirmed;

      const tokenEndpoint =
        'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
        address +
        '/tokens';
      let tokenBalances = [];
      try {
        const tokenBalancesResponse = await requestLocal(tokenEndpoint);
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

  async getBalance(address: string): Promise<number> {
    const endpoint = `${basePath}/v1/bsv/taalnet/address/${address}/balance`;
    const { confirmed, unconfirmed } = await requestLocal(endpoint);
    // TODO: validate response
    return confirmed + unconfirmed;
  }

  async tokens(address: string) {
    const tokenEndpoint =
      'https://taalnet.whatsonchain.com/v1/bsv/taalnet/address/' +
      address +
      '/tokens';
    let tokenBalances = [];

    try {
      const tokenBalancesResponse = await requestLocal(tokenEndpoint);
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

  async airdrop(address: string) {
    const endpoint = `${basePath}/faucet/send/${address}`;

    const { text: txid } = await requestLocal(endpoint, {
      headers: {
        Authorization: `Basic ${btoa('taal_private:dotheT@@l007')}`,
      },
    });

    // Check this is a valid hex string
    if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Failed to get funds: ${txid}`);
    }

    // store.dispatch(refreshBalance({ address }));

    return true;
  }
}

export const woc = new WOC();
