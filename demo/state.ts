type State = {
  isConnected: boolean;
  balance: number | null;
  publicKey: string | null;
  rootPublicKey: string | null;
  address: string | null;
  error: string | null;
  unspent: unknown[];
  transaction: unknown;
  signResult: unknown;
  signMessageResult: unknown;
};

let errorTimer: ReturnType<typeof setTimeout>;

export const state = new Proxy(
  {
    isConnected: false,
    balance: 0,
  } as State,
  {
    set: (target, key, value) => {
      const el = document.querySelector(`#${String(key)}`);
      if (el) {
        switch (typeof value) {
          case 'number': {
            el.innerHTML = value.toLocaleString();
            break;
          }

          case 'string': {
            el.innerHTML = value;
            break;
          }

          default:
            try {
              el.innerHTML = JSON.stringify(value);
            } catch (e) {
              el.innerHTML = e.message;
            }
            break;
        }
        el.innerHTML = typeof value === 'number' ? value.toLocaleString() : String(value);
      }
      target[key as string] = value;

      if (key === 'error') {
        clearTimeout(errorTimer);
        if (value !== '') {
          errorTimer = setTimeout(() => (state.error = ''), 5000);
        }
      }

      document.querySelector('#state').innerHTML = JSON.stringify(state, null, 2);
      return true;
    },
  }
);

state.isConnected = false;
state.balance = null;
state.publicKey = null;
state.address = null;
state.error = '';
state.unspent = [];
