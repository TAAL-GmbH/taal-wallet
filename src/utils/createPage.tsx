import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/src/store';
// @ts-expect-error convert to ts
import light from '@/themes/light';

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
    min-height: 100vh;
  }
  body {
    background-color: #fdfdfd;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    line-height: 1.25;
    color: ${light.color.grey[400]};

    * {
      box-sizing: border-box;
    }

    > div {
      min-height: 100vh;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${light.color.grey[700]};
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
    <ReduxProvider store={store}>
      <ThemeProvider theme={light}>
        <GlobalStyle />
        {component}
      </ThemeProvider>
    </ReduxProvider>
  );
};
