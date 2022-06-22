type State = {
  isConnected: boolean;
  balance: number | null;
  address: string | null;
  error: string | null;
};

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
        el.innerHTML =
          typeof value === 'number' ? value.toLocaleString() : String(value);
      }
      target[key as string] = value;

      if (key === 'error') {
        const errorEl: HTMLDivElement = document.querySelector('#error');
        errorEl.style.display = value === null ? 'none' : 'block';
        value !== null && setTimeout(() => (state.error = null), 5000);
      }

      document.querySelector('#state').innerHTML = JSON.stringify(
        state,
        null,
        2
      );
      return true;
    },
  }
);
