import { FC, useEffect, useState } from 'react';

import { SterileLayout } from '@/components/layout/sterile-layout';
import { getNotifications } from '@/utils/get-notifications';
import { BackupPassphraseNotification } from './backup-passphrase-notification';

const componentMap: Record<string, FC> = {
  backupPassphraseNotification: BackupPassphraseNotification,
};

export const BlockingNotification: FC = () => {
  const [notification, setNotification] = useState<Awaited<ReturnType<typeof getNotifications>> | null>(null);

  useEffect(() => {
    (async () => {
      setNotification(await getNotifications());
    })();
  }, []);

  const Component = notification && componentMap[notification.componentName];

  return (
    <SterileLayout showBackButton={false} showBurgerMenu={false} showTopHeader={false}>
      {Component ? <Component /> : <>Component not found</>}
    </SterileLayout>
  );
};
