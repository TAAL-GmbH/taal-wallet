import { DialogData } from '../types';

export type CreateDialogOptions = Omit<DialogData, 'id'> & {
  width?: number;
  height?: number;
};

export const createDialog = async (options: CreateDialogOptions) => {
  const id = Date.now() + Math.random();
  const key = `dialog: ${id}`;
  const { timeout = 30000, width = 500, height } = options;

  let resolveRef: (value: unknown) => void;
  let rejectRef: (value: unknown) => void;
  let rejectTimer: ReturnType<typeof setTimeout>;

  const cleanup = async () => {
    clearTimeout(rejectTimer);
    await chrome.storage.local.remove(key);
    chrome.storage.onChanged.removeListener(onStorageChange);
  };

  const onStorageChange = async (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    for (let [k, { oldValue, newValue }] of Object.entries(changes)) {
      if (k === key && oldValue) {
        await cleanup();
        resolveRef(newValue.response);
      }
    }
  };

  return new Promise(async (resolve, reject) => {
    rejectRef = reject;
    resolveRef = resolve;

    rejectTimer = setTimeout(async () => {
      await cleanup();
      resolve('timeout');
    }, timeout);

    chrome.storage.onChanged.addListener(onStorageChange);

    await chrome.storage.local.set({
      [key]: {
        ...options,
        id,
        timeout,
      },
    });

    chrome.windows.create({
      type: 'popup',
      url: chrome.runtime.getURL(`/src/pages/dialog/index.html?id=${id}`),
      width,
      height,
      focused: true,
    });
  });
};
