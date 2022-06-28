import { DialogData } from '../types';

export type CreateDialogOptions = Omit<DialogData, 'id'> & {
  width?: number;
  height?: number;
};

type CreateDialogReturnType = {
  error?: string;
  selectedOption?: string | number;
};

const defaultOptions: Partial<CreateDialogOptions> = {
  fitView: true,
  timeout: 0,
  width: 400,
  height: 500,
  resizeWindow: false,
};

export const createDialog = async (options: CreateDialogOptions): Promise<CreateDialogReturnType> => {
  const id = Date.now() + Math.random();
  const bc = new BroadcastChannel(`dialog-${id}`);
  const { timeout, width, height } = { ...options, ...defaultOptions };

  let resolveRef: (value: unknown) => void;
  let rejectRef: (value: unknown) => void;
  let rejectTimer: ReturnType<typeof setTimeout>;

  const cleanup = async () => {
    clearTimeout(rejectTimer);
    bc.close();
  };

  bc.onmessage = async ({ data }: { data: { action: string; payload?: unknown } }) => {
    console.log('onmessage', data);
    const { action, payload } = data;

    switch (action) {
      case 'getData': {
        bc.postMessage({
          action,
          payload: {
            ...defaultOptions,
            ...options,
          },
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

    if (timeout > 0) {
      rejectTimer = setTimeout(async () => {
        await cleanup();
        resolve({ error: 'timeout' });
      }, timeout);
    }

    chrome.windows.create({
      type: 'popup',
      url: chrome.runtime.getURL(`/src/pages/dialog/index.html?id=${id}`),
      width,
      height,
      focused: true,
    });
  });
};
