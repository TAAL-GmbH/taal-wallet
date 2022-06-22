import { DialogData } from '../types';

export type CreateDialogOptions = Omit<DialogData, 'id'> & {
  width?: number;
  height?: number;
};

type CreateDialogReturnType = {
  error?: string;
  selectedOption?: string | number;
};

export const createDialog = async (
  options: CreateDialogOptions
): Promise<CreateDialogReturnType> => {
  const id = Date.now() + Math.random();
  const bc = new BroadcastChannel(`dialog-${id}`);
  const { timeout = 30000, width = 500, height } = options;

  let resolveRef: (value: unknown) => void;
  let rejectRef: (value: unknown) => void;
  let rejectTimer: ReturnType<typeof setTimeout>;

  const cleanup = async () => {
    clearTimeout(rejectTimer);
  };

  bc.onmessage = async ({
    data,
  }: {
    data: { action: string; payload?: unknown };
  }) => {
    const { action, payload } = data;

    switch (action) {
      case 'getData': {
        bc.postMessage({
          action,
          payload: options,
        });
        break;
      }

      case 'response': {
        await cleanup();
        resolveRef(payload);
        break;
      }

      default:
        break;
    }
  };

  return new Promise(async (resolve, reject) => {
    rejectRef = reject;
    resolveRef = resolve;

    rejectTimer = setTimeout(async () => {
      await cleanup();
      resolve({ error: 'timeout' });
    }, timeout);

    chrome.windows.create({
      type: 'popup',
      url: chrome.runtime.getURL(`/src/pages/dialog/index.html?id=${id}`),
      width,
      height,
      focused: true,
    });
  });
};
