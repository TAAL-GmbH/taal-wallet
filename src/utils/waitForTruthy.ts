type TestFn = () => Promise<boolean> | boolean;
type Options = {
  timeout?: number;
  interval?: number;
};

export const waitForTruthy = (testFn: TestFn, options: Options = {}): Promise<boolean> => {
  const { timeout = 1000, interval = 50 } = options;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  let intervalTimer: ReturnType<typeof setInterval> | undefined;

  return new Promise(resolve => {
    intervalTimer = setInterval(async () => {
      let result = testFn();
      if (result instanceof Promise) {
        result = await result;
      }

      if (result) {
        clearTimeout(timeoutTimer);
        clearInterval(intervalTimer);
        resolve(true);
      }
    }, interval);

    timeoutTimer = setTimeout(() => {
      resolve(false);
      clearInterval(intervalTimer);
    }, timeout);
  });
};
