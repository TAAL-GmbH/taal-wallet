import { createPage } from '@/utils/create-page';
import { Dialog } from '@/pages/dialog/dialog';
import light from '@/themes/light';

createPage({
  domElement: document.querySelector('#app'),
  component: <Dialog />,
  theme: light,
});
