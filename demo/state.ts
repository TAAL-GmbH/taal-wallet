type State = {
  isConnected: boolean;
  balance: number | null;
  address: string | null;
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
        el.innerHTML =
          typeof value === 'number' ? value.toLocaleString() : String(value);
      }
      target[key as string] = value;

      document.querySelector('#state').innerHTML = JSON.stringify(
        state,
        null,
        2
      );
      return true;
    },
  }
);
