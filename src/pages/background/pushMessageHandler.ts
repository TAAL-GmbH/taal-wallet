import { setBalance } from '@/src/features/pkSlice';
import { store } from '@/src/store';

export const onPushMessage = async (e: Event) => {
  const { data } = e as PushEvent;

  if (data) {
    let json = {} as {
      data: Record<string, string>;
      fcmMessageId: string;
      from: string;
      priority: string;
      notification: {
        title: string;
        body?: string;
      };
    };
    let action: PushAction['action'] = '';
    let payload: PushAction['payload'];
    try {
      json = data?.json();
      console.log('on Web Push', json, e);
      action = json.data.action;
      payload = JSON.parse(json.data.payload);
    } catch (e) {
      console.error('Failed to parse json', e, data?.text());
    }

    const result = await handlePushAction({ action, payload });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'https://www.taal.com/wp-content/uploads/2021/04/cropped-taal_favicon-32x32.jpg',
      title: json.notification.title,
      message: json.notification.body || '',
    });
  } else {
    console.log('Push event but no data', e);
  }

  return e;
};

type PushAction = {
  action: string;
  payload: unknown;
};

const handlePushAction = async ({ action, payload }: PushAction) => {
  console.log('handlePushAction', { action, payload });
  switch (action) {
    case 'balance': {
      const { address, satoshis } = payload as {
        address: string;
        satoshis: number;
      };
      if (!address || !satoshis) {
        console.error('handlePushAction', { action, payload });
        return false;
      }
      store.dispatch(setBalance({ address, satoshis }));
      return true;
    }
    default: {
      console.error('handlePushAction', { action, payload });
      return false;
    }
  }
};
