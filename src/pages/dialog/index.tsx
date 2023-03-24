import { createPage } from '@/src/utils/createPage';
import { Dialog } from '@/pages/dialog/Dialog';
import light from '@/src/themes/light2023';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Dialog />,
  theme: light,
});
