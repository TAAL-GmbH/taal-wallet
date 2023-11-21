import { createPage } from '@/utils/create-page';
import { Connection } from '@/pages/connection/connection';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Connection />,
});
