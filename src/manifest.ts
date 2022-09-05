import packageJson from '../package.json';
import { ManifestType } from '@/src/manifest-type';

const isProd = process.env.NODE_ENV === 'production';

const manifest: ManifestType = {
  manifest_version: 3,
  name: isProd ? 'TAAL Wallet' : '[DEV] TAAL Wallet',
  version: packageJson.version,
  description: packageJson.description,
  options_page: 'src/pages/options/index.html',
  background: { service_worker: 'src/pages/background/index.js' },
  permissions: ['notifications', 'alarms'],
  externally_connectable: {
    matches: ['http://localhost/*', 'https://*.taal.com/*'],
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'taal-round-34x34.png',
  },
  icons: {
    '128': 'taal-round-128x128.png',
  },
  web_accessible_resources: [
    {
      resources: ['taal-round-128x128.png', 'taal-round-34x34.png', 'info.json'],
      matches: ['<all_urls>'],
    },
  ],
};

export default manifest;
