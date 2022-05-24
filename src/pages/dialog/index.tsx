import { createPage } from '@/src/utils/createPage';
import { Dialog } from '@/pages/dialog/Dialog';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Dialog />,
});
