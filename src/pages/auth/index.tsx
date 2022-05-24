import { createPage } from '@/src/utils/createPage';
import { Auth } from '@/pages/auth/Auth';

createPage({
  domElement: document.querySelector('#app-container'),
  component: <Auth />,
});
