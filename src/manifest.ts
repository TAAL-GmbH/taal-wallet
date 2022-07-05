import packageJson from '../package.json';
import { ManifestType } from '@/src/manifest-type';

const manifest: ManifestType = {
  manifest_version: 3,
  // name: packageJson.name,
  name: 'TAAL Web3 Wallet',
  version: packageJson.version,
  description: packageJson.description,
  options_page: 'src/pages/options/index.html',
  background: { service_worker: 'src/pages/background/index.js' },
  permissions: ['storage', 'notifications', 'alarms'],
  host_permissions: ['*://localhost/*'],
  externally_connectable: {
    matches: ['*://localhost/*'],
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'taal-round-34x34.png',
  },
  // chrome_url_overrides: {
  //   newtab: 'src/pages/newtab/index.html',
  // },
  icons: {
    '128': 'taal-round-128x128.png',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/content/index.js'],
      // css: ['contentStyle.css'],
    },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: [
        // 'contentStyle.css',
        'taal-round-128x128.png',
        'taal-round-34x34.png',
      ],
      matches: [],
    },
  ],
};

export default manifest;
