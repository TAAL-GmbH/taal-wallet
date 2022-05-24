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
        el.innerHTML = String(value);
      }
      // console.log('watch', { target, key, value });
      target[key] = value;

      document.querySelector('#state').innerHTML = JSON.stringify(
        state,
        null,
        2
      );
      return true;
    },
  }
);
