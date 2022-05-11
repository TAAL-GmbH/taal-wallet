import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from '@/pages/options/Options';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find AppContainer');
  }
  const root = createRoot(appContainer);
  root.render(<Options />);
}

init();
