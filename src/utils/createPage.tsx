import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
// @ts-expect-error convert to ts
import light from '@/themes/light';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #fdfdfd;
  }
`;

type Props = {
  domElement: HTMLElement | null;
  component: ReactNode;
};

export const createPage = ({ domElement, component }: Props) => {
  //   const appContainer = document.querySelector('#app-container');
  if (!domElement) {
    throw new Error('Can not find DOM element');
  }
  const root = createRoot(domElement);
  root.render(
    <ThemeProvider theme={light}>
      <GlobalStyle />
      {component}
    </ThemeProvider>
  );
};
