import { createPage } from '@/utils/create-page';
import { Options } from '@/pages/options/options';

createPage({
  domElement: document.querySelector('#app'),
  component: <Options />,
});
