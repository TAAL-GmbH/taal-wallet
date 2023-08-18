import { RootState, store } from '@/store';

type Action = Parameters<typeof store.dispatch>[0];
type TestFn = (arg0: RootState) => boolean;

export const dispatchAndValidate = (action: Action, testFn: TestFn, timeout = 1000): Promise<boolean> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return new Promise(resolve => {
    const unsubscribe = store.subscribe(() => {
      if (testFn(store.getState())) {
        onSuccess();
      }
    });

    timer = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const onSuccess = () => {
      unsubscribe();
      clearTimeout(timer);
      resolve(true);
    };

    store.dispatch(action);
  });
};
