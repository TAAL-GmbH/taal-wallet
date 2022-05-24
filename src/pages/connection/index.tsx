import { createPage } from '@/src/utils/createPage';
import { Connection } from '@/pages/connection/Connection';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Connection />,
});
