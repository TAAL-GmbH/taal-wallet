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

export class WOC {
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
