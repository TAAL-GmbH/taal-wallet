import { pk } from '../../libs/PK';
import { createPage } from '@/src/utils/createPage';
import Popup from '@/pages/popup/Popup';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Popup />,
});
