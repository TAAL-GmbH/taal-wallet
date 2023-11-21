import { createPage } from '@/utils/create-page';
import Popup from '@/pages/popup/popup';

createPage({
  domElement: document.querySelector('#app'),
  component: <Popup />,
});
