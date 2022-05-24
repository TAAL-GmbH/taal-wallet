import { createPage } from '@/src/utils/createPage';
import { Options } from '@/pages/options/Options';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Options />,
});
