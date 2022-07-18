import { useEffect } from 'react';

type Args = [() => Promise<void>, unknown[]] | [() => Promise<void>, () => void, unknown[]];

export const useAsyncEffect = (...args: Args) => {
  const effect = args[0];
  let returnFn = () => {};
  let dependencies: unknown[] = [];

  if (typeof args[1] === 'function') {
    returnFn = args[1];
    Array.isArray(args[2]) && (dependencies = args[2]);
  } else {
    dependencies = args[1];
  }

  return useEffect(() => {
    effect();
    return returnFn;
  }, dependencies);
};
