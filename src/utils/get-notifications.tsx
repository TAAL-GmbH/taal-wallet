import { db } from '@/db';
import { store } from '@/store';

type GetNotificationsResult = {
  componentName: string;
};

export const getNotifications = async (): Promise<GetNotificationsResult | null> => {
  const state = store.getState();
  const { account } = state;

  const hasPassphrase = account.accountMap[account.activeAccountId]?.hasPassphrase;
  if (hasPassphrase) {
    if ((await db.getKeyVal('isNotified.toBackupPassphrase')) !== true) {
      return {
        componentName: 'backupPassphraseNotification',
      };
    }
  }

  return null;
};
